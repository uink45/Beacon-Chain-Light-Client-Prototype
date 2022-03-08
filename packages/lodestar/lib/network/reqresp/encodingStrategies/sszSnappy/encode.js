"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeSszSnappyPayload = void 0;
const varint_1 = __importDefault(require("varint"));
const stream_to_it_1 = require("stream-to-it");
const snappy_stream_1 = require("@chainsafe/snappy-stream");
const errors_1 = require("./errors");
/**
 * ssz_snappy encoding strategy writer.
 * Yields byte chunks for encoded header and payload as defined in the spec:
 * ```
 * <encoding-dependent-header> | <encoded-payload>
 * ```
 */
async function* writeSszSnappyPayload(body, serializer) {
    const serializedBody = serializeSszBody(body, serializer);
    // MUST encode the length of the raw SSZ bytes, encoded as an unsigned protobuf varint
    yield Buffer.from(varint_1.default.encode(serializedBody.length));
    // By first computing and writing the SSZ byte length, the SSZ encoder can then directly
    // write the chunk contents to the stream. Snappy writer compresses frame by frame
    yield* encodeSszSnappy(serializedBody);
}
exports.writeSszSnappyPayload = writeSszSnappyPayload;
/**
 * Buffered Snappy writer
 */
function encodeSszSnappy(bytes) {
    const stream = (0, snappy_stream_1.createCompressStream)();
    stream.write(bytes);
    stream.end();
    return (0, stream_to_it_1.source)(stream);
}
/**
 * Returns SSZ serialized body. Wrapps errors with SszSnappyError.SERIALIZE_ERROR
 */
function serializeSszBody(body, serializer) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bytes = serializer.serialize(body);
        return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length);
    }
    catch (e) {
        throw new errors_1.SszSnappyError({ code: errors_1.SszSnappyErrorCode.SERIALIZE_ERROR, serializeError: e });
    }
}
//# sourceMappingURL=encode.js.map