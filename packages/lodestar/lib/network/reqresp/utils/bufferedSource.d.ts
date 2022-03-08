/// <reference types="node" />
import BufferList from "bl";
/**
 * Wraps a buffer chunk stream source with another async iterable
 * so it can be reused in multiple for..of statements.
 *
 * Uses a BufferList internally to make sure all chunks are consumed
 * when switching consumers
 */
export declare class BufferedSource {
    isDone: boolean;
    private buffer;
    private source;
    constructor(source: AsyncGenerator<Buffer>);
    [Symbol.asyncIterator](): AsyncIterator<BufferList>;
}
//# sourceMappingURL=bufferedSource.d.ts.map