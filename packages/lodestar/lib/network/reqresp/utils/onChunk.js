"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onChunk = void 0;
/**
 * Calls `callback` with each `chunk` received from the `source` AsyncIterable
 * Useful for logging, or cancelling timeouts
 */
function onChunk(callback) {
    return async function* onChunkTransform(source) {
        for await (const chunk of source) {
            callback(chunk);
            yield chunk;
        }
    };
}
exports.onChunk = onChunk;
//# sourceMappingURL=onChunk.js.map