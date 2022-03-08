"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newFilledArray = exports.newZeroedBigIntArray = exports.newZeroedArray = void 0;
/**
 * Returns an array of size `n` filled with 0
 * 20 times faster than
 * ```
 * Array.from({length: n}, () => 0)
 * ```
 * - Array.from: 40ms / 200_000 elements
 * - This fn: 2.2ms / 200_000 elements
 */
function newZeroedArray(n) {
    const arr = new Array(n);
    for (let i = 0; i < n; ++i) {
        arr[i] = 0;
    }
    return arr;
}
exports.newZeroedArray = newZeroedArray;
function newZeroedBigIntArray(n) {
    const arr = new Array(n);
    for (let i = 0; i < n; ++i) {
        arr[i] = BigInt(0);
    }
    return arr;
}
exports.newZeroedBigIntArray = newZeroedBigIntArray;
function newFilledArray(n, val) {
    const arr = new Array(n);
    for (let i = 0; i < n; ++i) {
        arr[i] = val;
    }
    return arr;
}
exports.newFilledArray = newFilledArray;
//# sourceMappingURL=array.js.map