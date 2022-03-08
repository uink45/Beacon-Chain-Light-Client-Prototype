/**
 * Same as [`it-pushable`](https://github.com/alanshaw/it-pushable/blob/76a67cbe92d1db940311ee07775dbc662697e09c/index.d.ts)
 * but it does not buffer values, and this.end() stops the AsyncGenerator immediately
 */
export declare class ItTrigger {
    private triggered;
    private ended;
    private error?;
    private onNext?;
    trigger(): void;
    end(err?: Error): void;
    [Symbol.asyncIterator](): this;
    next(): ReturnType<AsyncGenerator["next"]>;
    return(): ReturnType<AsyncGenerator["return"]>;
    throw(err: Error): ReturnType<AsyncGenerator["throw"]>;
}
//# sourceMappingURL=itTrigger.d.ts.map