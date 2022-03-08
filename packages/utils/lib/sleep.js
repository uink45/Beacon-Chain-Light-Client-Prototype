"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
const errors_1 = require("./errors");
/**
 * Abortable sleep function. Cleans everything on all cases preventing leaks
 * On abort throws ErrorAborted
 */
async function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
        if (signal && signal.aborted)
            return reject(new errors_1.ErrorAborted());
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        let onDone = () => { };
        const timeout = setTimeout(() => {
            onDone();
            resolve();
        }, ms);
        const onAbort = () => {
            onDone();
            reject(new errors_1.ErrorAborted());
        };
        if (signal)
            signal.addEventListener("abort", onAbort);
        onDone = () => {
            clearTimeout(timeout);
            if (signal)
                signal.removeEventListener("abort", onAbort);
        };
    });
}
exports.sleep = sleep;
//# sourceMappingURL=sleep.js.map