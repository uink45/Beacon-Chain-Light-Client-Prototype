"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItTrigger = void 0;
/**
 * Same as [`it-pushable`](https://github.com/alanshaw/it-pushable/blob/76a67cbe92d1db940311ee07775dbc662697e09c/index.d.ts)
 * but it does not buffer values, and this.end() stops the AsyncGenerator immediately
 */
class ItTrigger {
    constructor() {
        this.triggered = false;
        this.ended = false;
    }
    trigger() {
        this.triggered = true;
        if (this.onNext)
            this.onNext();
    }
    end(err) {
        if (err)
            this.error = err;
        else
            this.ended = true;
        if (this.onNext)
            this.onNext();
    }
    // AsyncGenerator API
    [Symbol.asyncIterator]() {
        return this;
    }
    async next() {
        if (this.error)
            throw this.error;
        if (this.ended)
            return { done: true, value: undefined };
        if (this.triggered) {
            this.triggered = false;
            return { done: false, value: undefined };
        }
        return new Promise((resolve) => {
            this.onNext = () => {
                this.onNext = undefined;
                resolve(this.next());
            };
        });
    }
    async return() {
        this.end();
        return { done: true, value: undefined };
    }
    async throw(err) {
        this.end(err);
        return { done: true, value: undefined };
    }
}
exports.ItTrigger = ItTrigger;
//# sourceMappingURL=itTrigger.js.map