"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForkNameFromResponseBody = exports.writeContextBytes = exports.responseEncodeError = exports.responseEncodeSuccess = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const constants_1 = require("../../../constants");
const encodingStrategies_1 = require("../encodingStrategies");
const utils_1 = require("../utils");
const types_1 = require("../types");
/**
 * Yields byte chunks for a `<response>` with a zero response code `<result>`
 * ```bnf
 * response        ::= <response_chunk>*
 * response_chunk  ::= <result> | <context-bytes> | <encoding-dependent-header> | <encoded-payload>
 * result          ::= "0"
 * ```
 * Note: `response` has zero or more chunks (denoted by `<>*`)
 */
function responseEncodeSuccess(config, protocol) {
    const contextBytesType = (0, types_1.contextBytesTypeByProtocol)(protocol);
    return async function* responseEncodeSuccessTransform(source) {
        for await (const chunk of source) {
            // <result>
            yield Buffer.from([constants_1.RespStatus.SUCCESS]);
            // <context-bytes> - from altair
            const forkName = getForkNameFromResponseBody(config, protocol, chunk);
            yield* writeContextBytes(config, contextBytesType, forkName);
            // <encoding-dependent-header> | <encoded-payload>
            const serializer = (0, types_1.getOutgoingSerializerByMethod)(protocol);
            yield* (0, encodingStrategies_1.writeEncodedPayload)(chunk, protocol.encoding, serializer);
        }
    };
}
exports.responseEncodeSuccess = responseEncodeSuccess;
/**
 * Yields byte chunks for a `<response_chunk>` with a non-zero response code `<result>`
 * denoted as `<error_response>`
 * ```bnf
 * error_response  ::= <result> | <error_message>?
 * result          ::= "1" | "2" | ["128" ... "255"]
 * ```
 * Only the last `<response_chunk>` is allowed to have a non-zero error code, so this
 * fn yields exactly one `<error_response>` and afterwards the stream must be terminated
 */
async function* responseEncodeError(status, errorMessage) {
    // <result>
    yield Buffer.from([status]);
    // <error_message>? is optional
    if (errorMessage) {
        yield (0, utils_1.encodeErrorMessage)(errorMessage);
    }
}
exports.responseEncodeError = responseEncodeError;
/**
 * Yields byte chunks for a `<context-bytes>`. See `ContextBytesType` for possible types.
 * This item is mandatory but may be empty.
 */
async function* writeContextBytes(config, contextBytesType, forkName) {
    switch (contextBytesType) {
        // Yield nothing
        case types_1.ContextBytesType.Empty:
            return;
        // Yield a fixed-width 4 byte chunk, set to the `ForkDigest`
        case types_1.ContextBytesType.ForkDigest:
            yield config.forkName2ForkDigest(forkName);
    }
}
exports.writeContextBytes = writeContextBytes;
function getForkNameFromResponseBody(config, protocol, body) {
    const requestTyped = { method: protocol.method, body };
    switch (requestTyped.method) {
        case types_1.Method.Status:
        case types_1.Method.Goodbye:
        case types_1.Method.Ping:
        case types_1.Method.Metadata:
            return lodestar_params_1.ForkName.phase0;
        case types_1.Method.BeaconBlocksByRange:
        case types_1.Method.BeaconBlocksByRoot:
            return config.getForkName(requestTyped.body.slot);
    }
}
exports.getForkNameFromResponseBody = getForkNameFromResponseBody;
//# sourceMappingURL=responseEncode.js.map