"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeEncodedPayload = exports.readEncodedPayload = void 0;
const types_1 = require("../types");
const decode_1 = require("./sszSnappy/decode");
const encode_1 = require("./sszSnappy/encode");
// For more info about eth2 request/response encoding strategies, see:
// https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/p2p-interface.md#encoding-strategies
// Supported encoding strategies:
// - ssz_snappy
/**
 * Consumes a stream source to read encoded header and payload as defined in the spec:
 * ```
 * <encoding-dependent-header> | <encoded-payload>
 * ```
 */
async function readEncodedPayload(bufferedSource, encoding, type, options) {
    switch (encoding) {
        case types_1.Encoding.SSZ_SNAPPY:
            return await (0, decode_1.readSszSnappyPayload)(bufferedSource, type, options);
        default:
            throw Error("Unsupported encoding");
    }
}
exports.readEncodedPayload = readEncodedPayload;
/**
 * Yields byte chunks for encoded header and payload as defined in the spec:
 * ```
 * <encoding-dependent-header> | <encoded-payload>
 * ```
 */
async function* writeEncodedPayload(body, encoding, serializer) {
    switch (encoding) {
        case types_1.Encoding.SSZ_SNAPPY:
            yield* (0, encode_1.writeSszSnappyPayload)(body, serializer);
            break;
        default:
            throw Error("Unsupported encoding");
    }
}
exports.writeEncodedPayload = writeEncodedPayload;
//# sourceMappingURL=index.js.map