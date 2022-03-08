/**
 * Wraps an AsyncIterable and rejects early if any signal aborts.
 * Throws the error returned by `getError()` of each signal options.
 *
 * Simplified fork of `"abortable-iterator"`.
 * Read function's source for reasoning of the fork.
 */
export declare function abortableSource<T>(sourceArg: AsyncIterable<T>, signals: {
    signal: AbortSignal;
    getError: () => Error;
}[]): AsyncIterable<T>;
//# sourceMappingURL=abortableSource.d.ts.map