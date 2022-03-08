"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEffectiveBalanceIncrementsWithLen = exports.getEffectiveBalanceIncrementsZeroed = void 0;
/** Helper to prevent re-writting tests downstream if we change Uint8Array to number[] */
function getEffectiveBalanceIncrementsZeroed(len) {
    return new Uint8Array(len);
}
exports.getEffectiveBalanceIncrementsZeroed = getEffectiveBalanceIncrementsZeroed;
/**
 * effectiveBalanceIncrements length will always be equal or greater than validatorCount. The
 * getEffectiveBalanceIncrementsByteLen() modulo is used to reduce the frequency at which its Uint8Array is recreated.
 * if effectiveBalanceIncrements has length greater than validatorCount it's not a problem since those values would
 * never be accessed.
 */
function getEffectiveBalanceIncrementsWithLen(validatorCount) {
    // TODO: Research what's the best number to minimize both memory cost and copy costs
    const byteLen = 1024 * Math.ceil(validatorCount / 1024);
    return new Uint8Array(byteLen);
}
exports.getEffectiveBalanceIncrementsWithLen = getEffectiveBalanceIncrementsWithLen;
//# sourceMappingURL=effectiveBalanceIncrements.js.map