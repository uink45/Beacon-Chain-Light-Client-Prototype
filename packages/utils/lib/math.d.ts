/**
 * @module util/math
 */
/**
 * Return the min number between two big numbers.
 */
export declare function bigIntMin(a: bigint, b: bigint): bigint;
/**
 * Return the max number between two big numbers.
 */
export declare function bigIntMax(a: bigint, b: bigint): bigint;
export declare function intDiv(dividend: number, divisor: number): number;
/**
 * Calculate the largest integer k such that k**2 <= n.
 */
export declare function intSqrt(n: number): number;
export declare function bigIntSqrt(n: bigint): bigint;
/**
 * Regenerates a random integer between min (included) and max (excluded).
 */
export declare function randBetween(min: number, max: number): number;
/**
 * Wraps randBetween and returns a bigNumber.
 * @returns {bigint}
 */
export declare function randBetweenBigInt(min: number, max: number): bigint;
//# sourceMappingURL=math.d.ts.map