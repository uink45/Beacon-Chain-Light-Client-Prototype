"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SszSnappyError = exports.SszSnappyErrorCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
var SszSnappyErrorCode;
(function (SszSnappyErrorCode) {
    /** Invalid number of bytes for protobuf varint */
    SszSnappyErrorCode["INVALID_VARINT_BYTES_COUNT"] = "SSZ_SNAPPY_ERROR_INVALID_VARINT_BYTES_COUNT";
    /** Parsed sszDataLength is under the SSZ type min size */
    SszSnappyErrorCode["UNDER_SSZ_MIN_SIZE"] = "SSZ_SNAPPY_ERROR_UNDER_SSZ_MIN_SIZE";
    /** Parsed sszDataLength is over the SSZ type max size */
    SszSnappyErrorCode["OVER_SSZ_MAX_SIZE"] = "SSZ_SNAPPY_ERROR_OVER_SSZ_MAX_SIZE";
    SszSnappyErrorCode["TOO_MUCH_BYTES_READ"] = "SSZ_SNAPPY_ERROR_TOO_MUCH_BYTES_READ";
    SszSnappyErrorCode["DECOMPRESSOR_ERROR"] = "SSZ_SNAPPY_ERROR_DECOMPRESSOR_ERROR";
    SszSnappyErrorCode["DESERIALIZE_ERROR"] = "SSZ_SNAPPY_ERROR_DESERIALIZE_ERROR";
    SszSnappyErrorCode["SERIALIZE_ERROR"] = "SSZ_SNAPPY_ERROR_SERIALIZE_ERROR";
    /** Received more bytes than specified sszDataLength */
    SszSnappyErrorCode["TOO_MANY_BYTES"] = "SSZ_SNAPPY_ERROR_TOO_MANY_BYTES";
    /** Source aborted before reading sszDataLength bytes */
    SszSnappyErrorCode["SOURCE_ABORTED"] = "SSZ_SNAPPY_ERROR_SOURCE_ABORTED";
})(SszSnappyErrorCode = exports.SszSnappyErrorCode || (exports.SszSnappyErrorCode = {}));
class SszSnappyError extends lodestar_utils_1.LodestarError {
    constructor(type) {
        super(type);
    }
}
exports.SszSnappyError = SszSnappyError;
//# sourceMappingURL=errors.js.map