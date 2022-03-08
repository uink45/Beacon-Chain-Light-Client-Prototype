"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readContextBytesForkDigest = exports.readForkName = exports.readErrorMessage = exports.readResultHeader = exports.responseDecode = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const constants_1 = require("../../../constants");
const utils_1 = require("../utils");
const encodingStrategies_1 = require("../encodingStrategies");
const response_1 = require("../response");
const types_1 = require("../types");
/**
 * Internal helper type to signal stream ended early
 */
var StreamStatus;
(function (StreamStatus) {
    StreamStatus["Ended"] = "STREAM_ENDED";
})(StreamStatus || (StreamStatus = {}));
/**
 * Consumes a stream source to read a `<response>`
 * ```bnf
 * response        ::= <response_chunk>*
 * response_chunk  ::= <result> | <context-bytes> | <encoding-dependent-header> | <encoded-payload>
 * result          ::= "0" | "1" | "2" | ["128" ... "255"]
 * ```
 */
function responseDecode(forkDigestContext, protocol) {
    return async function* responseDecodeSink(source) {
        const deserializeToTree = types_1.deserializeToTreeByMethod[protocol.method];
        const contextBytesType = (0, types_1.contextBytesTypeByProtocol)(protocol);
        const bufferedSource = new utils_1.BufferedSource(source);
        // Consumers of `responseDecode()` may limit the number of <response_chunk> and break out of the while loop
        while (!bufferedSource.isDone) {
            const status = await readResultHeader(bufferedSource);
            // Stream is only allowed to end at the start of a <response_chunk> block
            // The happens when source ends before readResultHeader() can fetch 1 byte
            if (status === StreamStatus.Ended) {
                break;
            }
            // For multiple chunks, only the last chunk is allowed to have a non-zero error
            // code (i.e. The chunk stream is terminated once an error occurs
            if (status !== constants_1.RespStatus.SUCCESS) {
                const errorMessage = await readErrorMessage(bufferedSource);
                throw new response_1.ResponseError(status, errorMessage);
            }
            const forkName = await readForkName(forkDigestContext, bufferedSource, contextBytesType);
            const type = (0, types_1.getResponseSzzTypeByMethod)(protocol, forkName);
            yield await (0, encodingStrategies_1.readEncodedPayload)(bufferedSource, protocol.encoding, type, { deserializeToTree });
        }
    };
}
exports.responseDecode = responseDecode;
/**
 * Consumes a stream source to read a `<result>`
 * ```bnf
 * result  ::= "0" | "1" | "2" | ["128" ... "255"]
 * ```
 * `<response_chunk>` starts with a single-byte response code which determines the contents of the response_chunk
 */
async function readResultHeader(bufferedSource) {
    for await (const buffer of bufferedSource) {
        const status = buffer.get(0);
        buffer.consume(1);
        // If first chunk had zero bytes status === null, get next
        if (status !== null) {
            return status;
        }
    }
    return StreamStatus.Ended;
}
exports.readResultHeader = readResultHeader;
/**
 * Consumes a stream source to read an optional `<error_response>?`
 * ```bnf
 * error_response  ::= <result> | <error_message>?
 * result          ::= "1" | "2" | ["128" ... "255"]
 * ```
 */
async function readErrorMessage(bufferedSource) {
    for await (const buffer of bufferedSource) {
        // Wait for next chunk with bytes or for the stream to end
        // Note: The entire <error_message> is expected to be in the same chunk
        if (buffer.length === 0) {
            continue;
        }
        const bytes = buffer.slice();
        try {
            return (0, utils_1.decodeErrorMessage)(bytes);
        }
        catch {
            return bytes.toString("hex");
        }
    }
    // Error message is optional and may not be included in the response stream
    return "";
}
exports.readErrorMessage = readErrorMessage;
/**
 * Consumes a stream source to read a variable length `<context-bytes>` depending on the method.
 * While `<context-bytes>` has a single type of `ForkDigest`, this function only parses the `ForkName`
 * of the `ForkDigest` or defaults to `phase0`
 */
async function readForkName(forkDigestContext, bufferedSource, contextBytes) {
    switch (contextBytes) {
        case types_1.ContextBytesType.Empty:
            return lodestar_params_1.ForkName.phase0;
        case types_1.ContextBytesType.ForkDigest: {
            const forkDigest = await readContextBytesForkDigest(bufferedSource);
            return forkDigestContext.forkDigest2ForkName(forkDigest);
        }
    }
}
exports.readForkName = readForkName;
/**
 * Consumes a stream source to read `<context-bytes>`, where it's a fixed-width 4 byte
 */
async function readContextBytesForkDigest(bufferedSource) {
    for await (const buffer of bufferedSource) {
        if (buffer.length >= types_1.CONTEXT_BYTES_FORK_DIGEST_LENGTH) {
            const bytes = buffer.slice(0, types_1.CONTEXT_BYTES_FORK_DIGEST_LENGTH);
            buffer.consume(types_1.CONTEXT_BYTES_FORK_DIGEST_LENGTH);
            return bytes;
        }
    }
    // TODO: Use typed error
    throw Error("Source ended while reading context bytes");
}
exports.readContextBytesForkDigest = readContextBytesForkDigest;
//# sourceMappingURL=responseDecode.js.map