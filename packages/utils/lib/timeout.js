"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTimeout = void 0;
const abort_controller_1 = require("@chainsafe/abort-controller");
const any_signal_1 = require("any-signal");
const errors_1 = require("./errors");
const sleep_1 = require("./sleep");
async function withTimeout(asyncFn, timeoutMs, signal) {
    const timeoutAbortController = new abort_controller_1.AbortController();
    const timeoutAndParentSignal = (0, any_signal_1.anySignal)([timeoutAbortController.signal, ...(signal ? [signal] : [])]);
    async function timeoutPromise(signal) {
        await (0, sleep_1.sleep)(timeoutMs, signal);
        throw new errors_1.TimeoutError();
    }
    try {
        return await Promise.race([asyncFn(timeoutAndParentSignal), timeoutPromise(timeoutAndParentSignal)]);
    }
    finally {
        timeoutAbortController.abort();
    }
}
exports.withTimeout = withTimeout;
//# sourceMappingURL=timeout.js.map