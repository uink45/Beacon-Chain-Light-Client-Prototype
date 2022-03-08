"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferedSource = void 0;
const bl_1 = __importDefault(require("bl"));
/**
 * Wraps a buffer chunk stream source with another async iterable
 * so it can be reused in multiple for..of statements.
 *
 * Uses a BufferList internally to make sure all chunks are consumed
 * when switching consumers
 */
class BufferedSource {
    constructor(source) {
        this.isDone = false;
        this.buffer = new bl_1.default();
        this.source = source;
    }
    [Symbol.asyncIterator]() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        let firstNext = true;
        return {
            async next() {
                // Prevent fetching a new chunk if there are pending bytes
                // not processed by a previous consumer of this BufferedSource
                if (firstNext && that.buffer.length > 0) {
                    firstNext = false;
                    return { done: false, value: that.buffer };
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const { done, value: chunk } = await that.source.next();
                if (done === true) {
                    that.isDone = true;
                    return { done: true, value: undefined };
                }
                else {
                    // Concat new chunk and return a reference to its BufferList instance
                    that.buffer.append(chunk);
                    return { done: false, value: that.buffer };
                }
            },
        };
    }
}
exports.BufferedSource = BufferedSource;
//# sourceMappingURL=bufferedSource.js.map