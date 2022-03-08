"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abortableSource = void 0;
/**
 * Wraps an AsyncIterable and rejects early if any signal aborts.
 * Throws the error returned by `getError()` of each signal options.
 *
 * Simplified fork of `"abortable-iterator"`.
 * Read function's source for reasoning of the fork.
 */
function abortableSource(sourceArg, signals) {
    const source = sourceArg;
    async function* abortable() {
        // Handler that will hold a reference to the `abort()` promise,
        // necessary for the signal abort listeners to reject the iterable promise
        let nextAbortHandler = null;
        // For each signal register an abortHandler(), and prepare clean-up with `onDoneCbs`
        const onDoneCbs = [];
        for (const { signal, getError } of signals) {
            const abortHandler = () => {
                if (nextAbortHandler)
                    nextAbortHandler(getError());
            };
            signal.addEventListener("abort", abortHandler);
            onDoneCbs.push(() => {
                signal.removeEventListener("abort", abortHandler);
            });
        }
        try {
            while (true) {
                // Abort early if any signal is aborted
                for (const { signal, getError } of signals) {
                    if (signal.aborted) {
                        throw getError();
                    }
                }
                // Race the iterator and the abort signals
                const result = await Promise.race([
                    new Promise((_, reject) => {
                        nextAbortHandler = (error) => reject(error);
                    }),
                    source.next(),
                ]);
                // source.next() resolved first
                nextAbortHandler = null;
                if (result.done) {
                    return;
                }
                else {
                    yield result.value;
                }
            }
        }
        catch (err) {
            // End the iterator if it is a generator
            if (typeof source.return === "function") {
                // This source.return() function may never resolve depending on the source AsyncGenerator implementation.
                // This is the main reason to fork "abortable-iterator", which caused our node to get stuck during Sync.
                // We choose to call .return() but not await it. In general, source.return should never throw. If it does,
                // it a problem of the source implementor, and thus logged as an unhandled rejection. If that happens,
                // the source implementor should fix the upstream code.
                void source.return(null);
            }
            throw err;
        }
        finally {
            for (const cb of onDoneCbs) {
                cb();
            }
        }
    }
    return abortable();
}
exports.abortableSource = abortableSource;
//# sourceMappingURL=abortableSource.js.map