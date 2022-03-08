"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultPoolSize = exports.chunkifyMaximizeChunkSize = void 0;
/**
 * Splits an array into an array of arrays maximizing the size of the smallest chunk.
 */
function chunkifyMaximizeChunkSize(arr, minPerChunk) {
    const chunkCount = Math.floor(arr.length / minPerChunk);
    if (chunkCount <= 1) {
        return [arr];
    }
    // Prefer less chunks of bigger size
    const perChunk = Math.ceil(arr.length / chunkCount);
    const arrArr = [];
    for (let i = 0; i < arr.length; i += perChunk) {
        arrArr.push(arr.slice(i, i + perChunk));
    }
    return arrArr;
}
exports.chunkifyMaximizeChunkSize = chunkifyMaximizeChunkSize;
/**
 * Cross-platform fetch an aprox number of logical cores
 */
function getDefaultPoolSize() {
    var _a;
    if (typeof navigator !== "undefined") {
        return (_a = navigator.hardwareConcurrency) !== null && _a !== void 0 ? _a : 4;
    }
    if (typeof require !== "undefined") {
        // eslint-disable-next-line
        return require("node:os").cpus().length;
    }
    return 8;
}
exports.getDefaultPoolSize = getDefaultPoolSize;
//# sourceMappingURL=utils.js.map