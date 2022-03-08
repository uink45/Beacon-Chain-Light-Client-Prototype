"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxEncodedLen = void 0;
/**
 * Computes the worst-case compression result by SSZ-Snappy
 */
function maxEncodedLen(sszLength) {
    // worst-case compression result by Snappy
    return 32 + sszLength + sszLength / 6;
}
exports.maxEncodedLen = maxEncodedLen;
//# sourceMappingURL=utils.js.map