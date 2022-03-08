/**
 * Split an inclusive range into a sequence of contiguous inclusive ranges
 * ```
 * [[a,b], [c,d] ... Sn] = chunkifyInclusiveRange([a,z], n)
 * // where
 * [a,z] = [a,b] U [c,d] U ... U Sn
 * ```
 * @param from range start inclusive
 * @param to range end inclusive
 * @param chunks Maximum number of chunks, if range is big enough
 */
export declare function chunkifyInclusiveRange(from: number, to: number, itemsPerChunk: number): number[][];
//# sourceMappingURL=chunkify.d.ts.map