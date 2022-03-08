"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRequest = exports.RequestErrorCode = exports.RequestError = void 0;
const it_pipe_1 = __importDefault(require("it-pipe"));
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const constants_1 = require("../../../constants");
const util_1 = require("../../util");
const utils_1 = require("../utils");
const response_1 = require("../response");
const requestEncode_1 = require("../encoders/requestEncode");
const responseDecode_1 = require("../encoders/responseDecode");
const collectResponses_1 = require("./collectResponses");
const responseTimeoutsHandler_1 = require("./responseTimeoutsHandler");
const errors_1 = require("./errors");
Object.defineProperty(exports, "RequestError", { enumerable: true, get: function () { return errors_1.RequestError; } });
Object.defineProperty(exports, "RequestErrorCode", { enumerable: true, get: function () { return errors_1.RequestErrorCode; } });
/**
 * Sends ReqResp request to a peer. Throws on error. Logs each step of the request lifecycle.
 *
 * 1. Dial peer, establish duplex stream
 * 2. Encoded and write request to peer. Expect the responder to close the stream's write side
 * 3. Read and decode reponse(s) from peer. Will close the read stream if:
 *    - An error result is received in one of the chunks. Reads the error_message and throws.
 *    - The responder closes the stream. If at the end or start of a <response_chunk>, return. Otherwise throws
 *    - Any part of the response_chunk fails validation. Throws a typed error (see `SszSnappyError`)
 *    - The maximum number of requested chunks are read. Does not throw, returns read chunks only.
 */
async function sendRequest({ logger, forkDigestContext, libp2p }, peerId, method, encoding, versions, requestBody, maxResponses, signal, options, requestId = 0) {
    const { REQUEST_TIMEOUT, DIAL_TIMEOUT } = { ...constants_1.timeoutOptions, ...options };
    const peer = (0, util_1.prettyPrintPeerId)(peerId);
    const client = (0, util_1.getClientFromPeerStore)(peerId, libp2p.peerStore.metadataBook);
    const logCtx = { method, encoding, client, peer, requestId };
    if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
        throw new lodestar_utils_1.ErrorAborted("sendRequest");
    }
    logger.debug("Req  dialing peer", logCtx);
    try {
        // From Altair block query methods have V1 and V2. Both protocols should be requested.
        // On stream negotiation `libp2p.dialProtocol` will pick the available protocol and return
        // the picked protocol in `connection.protocol`
        const protocols = new Map(versions.map((version) => [(0, utils_1.formatProtocolId)(method, version, encoding), { method, version, encoding }]));
        // As of October 2020 we can't rely on libp2p.dialProtocol timeout to work so
        // this function wraps the dialProtocol promise with an extra timeout
        //
        // > The issue might be: you add the peer's addresses to the AddressBook,
        //   which will result in autoDial to kick in and dial your peer. In parallel,
        //   you do a manual dial and it will wait for the previous one without using
        //   the abort signal:
        //
        // https://github.com/ChainSafe/lodestar/issues/1597#issuecomment-703394386
        // DIAL_TIMEOUT: Non-spec timeout from dialing protocol until stream opened
        const { stream, protocol: protocolId } = await (0, lodestar_utils_1.withTimeout)(async (timeoutAndParentSignal) => {
            const protocolIds = Array.from(protocols.keys());
            const conn = await libp2p.dialProtocol(peerId, protocolIds, { signal: timeoutAndParentSignal });
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (!conn)
                throw Error("dialProtocol timeout");
            // TODO: libp2p-ts type Stream does not declare .abort() and requires casting to unknown here
            // Remove when https://github.com/ChainSafe/lodestar/issues/2167
            // After #2167 upstream types are still not good enough, and require casting
            return conn;
        }, DIAL_TIMEOUT, signal).catch((e) => {
            if (e instanceof lodestar_utils_1.TimeoutError) {
                throw new errors_1.RequestInternalError({ code: errors_1.RequestErrorCode.DIAL_TIMEOUT });
            }
            else {
                throw new errors_1.RequestInternalError({ code: errors_1.RequestErrorCode.DIAL_ERROR, error: e });
            }
        });
        // Parse protocol selected by the responder
        const protocol = protocols.get(protocolId);
        if (!protocol)
            throw Error(`dialProtocol selected unknown protocolId ${protocolId}`);
        logger.debug("Req  sending request", { ...logCtx, body: (0, utils_1.renderRequestBody)(method, requestBody) });
        // Spec: The requester MUST close the write side of the stream once it finishes writing the request message
        // Impl: stream.sink is closed automatically by js-libp2p-mplex when piped source is exhausted
        // REQUEST_TIMEOUT: Non-spec timeout from sending request until write stream closed by responder
        // Note: libp2p.stop() will close all connections, so not necessary to abort this pipe on parent stop
        await (0, lodestar_utils_1.withTimeout)(() => (0, it_pipe_1.default)((0, requestEncode_1.requestEncode)(protocol, requestBody), stream.sink), REQUEST_TIMEOUT, signal).catch((e) => {
            // Must close the stream read side (stream.source) manually AND the write side
            stream.abort(e);
            if (e instanceof lodestar_utils_1.TimeoutError) {
                throw new errors_1.RequestInternalError({ code: errors_1.RequestErrorCode.REQUEST_TIMEOUT });
            }
            else {
                throw new errors_1.RequestInternalError({ code: errors_1.RequestErrorCode.REQUEST_ERROR, error: e });
            }
        });
        logger.debug("Req  request sent", logCtx);
        try {
            // Note: libp2p.stop() will close all connections, so not necessary to abort this pipe on parent stop
            const responses = await (0, lodestar_utils_1.withTimeout)(() => (0, it_pipe_1.default)(stream.source, (0, responseTimeoutsHandler_1.responseTimeoutsHandler)((0, responseDecode_1.responseDecode)(forkDigestContext, protocol), options), (0, collectResponses_1.collectResponses)(method, maxResponses)), (0, responseTimeoutsHandler_1.maxTotalResponseTimeout)(maxResponses, options)).catch((e) => {
                // No need to close the stream here, the outter finally {} block will
                if (e instanceof lodestar_utils_1.TimeoutError) {
                    throw new errors_1.RequestInternalError({ code: errors_1.RequestErrorCode.RESPONSE_TIMEOUT });
                }
                else {
                    throw e; // The error will be typed in the outter catch {} block
                }
            });
            // NOTE: Only log once per request to verbose, intermediate steps to debug
            // NOTE: Do not log the response, logs get extremely cluttered
            // NOTE: add double space after "Req  " to align log with the "Resp " log
            const numResponse = Array.isArray(responses) ? responses.length : 1;
            logger.verbose("Req  done", { ...logCtx, numResponse });
            return responses;
        }
        finally {
            // Necessary to call `stream.close()` since collectResponses() may break out of the source before exhausting it
            // `stream.close()` libp2p-mplex will .end() the source (it-pushable instance)
            // If collectResponses() exhausts the source, it-pushable.end() can be safely called multiple times
            stream.close();
        }
    }
    catch (e) {
        logger.verbose("Req  error", logCtx, e);
        const metadata = { method, encoding, peer };
        if (e instanceof response_1.ResponseError) {
            throw new errors_1.RequestError((0, errors_1.responseStatusErrorToRequestError)(e), metadata);
        }
        else if (e instanceof errors_1.RequestInternalError) {
            throw new errors_1.RequestError(e.type, metadata);
        }
        else {
            throw e;
        }
    }
}
exports.sendRequest = sendRequest;
//# sourceMappingURL=index.js.map