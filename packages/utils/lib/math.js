"use strict";
/**
 * @module util/math
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.randBetweenBigInt = exports.randBetween = exports.bigIntSqrt = exports.intSqrt = exports.intDiv = exports.bigIntMax = exports.bigIntMin = void 0;
/**
 * Return the min number between two big numbers.
 */
function bigIntMin(a, b) {
    return a < b ? a : b;
}
exports.bigIntMin = bigIntMin;
/**
 * Return the max number between two big numbers.
 */
function bigIntMax(a, b) {
    return a > b ? a : b;
}
exports.bigIntMax = bigIntMax;
function intDiv(dividend, divisor) {
    return Math.floor(dividend / divisor);
}
exports.intDiv = intDiv;
/**
 * Calculate the largest integer k such that k**2 <= n.
 */
function intSqrt(n) {
    let x = n;
    let y = intDiv(x + 1, 2);
    while (y < x) {
        x = y;
        y = intDiv(x + intDiv(n, x), 2);
    }
    return x;
}
exports.intSqrt = intSqrt;
function bigIntSqrt(n) {
    let x = n;
    let y = (x + BigInt(1)) / BigInt(2);
    while (y < x) {
        x = y;
        y = (x + n / x) / BigInt(2);
    }
    return x;
}
exports.bigIntSqrt = bigIntSqrt;
/**
 * Regenerates a random integer between min (included) and max (excluded).
 */
function randBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
exports.randBetween = randBetween;
/**
 * Wraps randBetween and returns a bigNumber.
 * @returns {bigint}
 */
function randBetweenBigInt(min, max) {
    return BigInt(randBetween(min, max));
}
exports.randBetweenBigInt = randBetweenBigInt;
//# sourceMappingURL=math.js.map