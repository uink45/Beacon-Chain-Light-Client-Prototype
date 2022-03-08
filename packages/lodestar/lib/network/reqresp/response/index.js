"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequest = exports.ResponseError = void 0;
const it_pipe_1 = __importDefault(require("it-pipe"));
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const constants_1 = require("../../../constants");
const util_1 = require("../../util");
const utils_1 = require("../utils");
const requestDecode_1 = require("../encoders/requestDecode");
const responseEncode_1 = require("../encoders/responseEncode");
const errors_1 = require("./errors");
Object.defineProperty(exports, "ResponseError", { enumerable: true, get: function () { return errors_1.ResponseError; } });
/**
 * Handles a ReqResp request from a peer. Throws on error. Logs each step of the response lifecycle.
 *
 * 1. A duplex `stream` with the peer is already available
 * 2. Read and decode request from peer
 * 3. Delegate to `performRequestHandler()` to perform the request job and expect
 *    to yield zero or more `<response_chunks>`
 * 4a. Encode and write `<response_chunks>` to peer
 * 4b. On error, encode and write an error `<response_chunk>` and stop
 */
async function handleRequest({ config, logger, libp2p }, performRequestHandler, stream, peerId, protocol, signal, requestId = 0) {
    const client = (0, util_1.getClientFromPeerStore)(peerId, libp2p.peerStore.metadataBook);
    const logCtx = { method: protocol.method, client, peer: (0, util_1.prettyPrintPeerId)(peerId), requestId };
    let responseError = null;
    await (0, it_pipe_1.default)(
    // Yields success chunks and error chunks in the same generator
    // This syntax allows to recycle stream.sink to send success and error chunks without returning
    // in case request whose body is a List fails at chunk_i > 0, without breaking out of the for..await..of
    (async function* requestHandlerSource() {
        try {
            const requestBody = await (0, lodestar_utils_1.withTimeout)(() => (0, it_pipe_1.default)(stream.source, (0, requestDecode_1.requestDecode)(protocol)), constants_1.REQUEST_TIMEOUT, signal).catch((e) => {
                if (e instanceof lodestar_utils_1.TimeoutError) {
                    throw e; // Let outter catch {} re-type the error as SERVER_ERROR
                }
                else {
                    throw new errors_1.ResponseError(constants_1.RespStatus.INVALID_REQUEST, e.message);
                }
            });
            logger.debug("Resp received request", { ...logCtx, body: (0, utils_1.renderRequestBody)(protocol.method, requestBody) });
            yield* (0, it_pipe_1.default)(performRequestHandler(protocol, requestBody, peerId), 
            // NOTE: Do not log the resp chunk contents, logs get extremely cluttered
            // Note: Not logging on each chunk since after 1 year it hasn't add any value when debugging
            // onChunk(() => logger.debug("Resp sending chunk", logCtx)),
            (0, responseEncode_1.responseEncodeSuccess)(config, protocol));
        }
        catch (e) {
            const status = e instanceof errors_1.ResponseError ? e.status : constants_1.RespStatus.SERVER_ERROR;
            yield* (0, responseEncode_1.responseEncodeError)(status, e.message);
            // Should not throw an error here or libp2p-mplex throws with 'AbortError: stream reset'
            // throw e;
            responseError = e;
        }
    })(), stream.sink);
    // If streak.sink throws, libp2p-mplex will close stream.source
    // If `requestDecode()` throws the stream.source must be closed manually
    // To ensure the stream.source it-pushable instance is always closed, stream.close() is called always
    stream.close();
    // TODO: It may happen that stream.sink returns before returning stream.source first,
    // so you never see "Resp received request" in the logs and the response ends without
    // sending any chunk, triggering EMPTY_RESPONSE error on the requesting side
    // It has only happened when doing a request too fast upon immediate connection on inbound peer
    // investigate a potential race condition there
    if (responseError !== null) {
        logger.verbose("Resp error", logCtx, responseError);
        throw responseError;
    }
    else {
        // NOTE: Only log once per request to verbose, intermediate steps to debug
        logger.verbose("Resp done", logCtx);
    }
}
exports.handleRequest = handleRequest;
//# sourceMappingURL=index.js.map