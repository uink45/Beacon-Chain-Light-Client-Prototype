/**
 * Returns an array of size `n` filled with 0
 * 20 times faster than
 * ```
 * Array.from({length: n}, () => 0)
 * ```
 * - Array.from: 40ms / 200_000 elements
 * - This fn: 2.2ms / 200_000 elements
 */
export declare function newZeroedArray(n: number): number[];
export declare function newZeroedBigIntArray(n: number): bigint[];
export declare function newFilledArray<T>(n: number, val: T): T[];
//# sourceMappingURL=array.d.ts.map