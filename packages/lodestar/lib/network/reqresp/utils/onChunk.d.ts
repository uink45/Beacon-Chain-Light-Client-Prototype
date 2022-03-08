/**
 * Calls `callback` with each `chunk` received from the `source` AsyncIterable
 * Useful for logging, or cancelling timeouts
 */
export declare function onChunk<T>(callback: (chunk: T) => void): (source: AsyncIterable<T>) => AsyncIterable<T>;
//# sourceMappingURL=onChunk.d.ts.map