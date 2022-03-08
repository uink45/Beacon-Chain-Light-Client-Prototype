"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkifyInclusiveRange = void 0;
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
function chunkifyInclusiveRange(from, to, chunkCount) {
    // Enforce chunkCount >= 1
    if (chunkCount < 1)
        chunkCount = 1;
    const totalItems = to - from + 1;
    const itemsPerChunk = Math.ceil(totalItems / chunkCount);
    const chunks = [];
    for (let i = 0; i < chunkCount; i++) {
        const _from = from + i * itemsPerChunk;
        const _to = Math.min(from + (i + 1) * itemsPerChunk - 1, to);
        chunks.push([_from, _to]);
        if (_to >= to)
            break;
    }
    return chunks;
}
exports.chunkifyInclusiveRange = chunkifyInclusiveRange;
//# sourceMappingURL=chunkify.js.map