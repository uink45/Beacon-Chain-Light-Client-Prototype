"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
/**
 * Retry a given function on error.
 * @param fn Async callback to retry. Invoked with 1 parameter
 * A Number identifying the attempt. The absolute first attempt (before any retries) is 1
 * @param opts
 */
async function retry(fn, opts) {
    var _a;
    const maxRetries = (_a = opts === null || opts === void 0 ? void 0 : opts.retries) !== null && _a !== void 0 ? _a : 5;
    const shouldRetry = opts === null || opts === void 0 ? void 0 : opts.shouldRetry;
    let lastError = Error("RetryError");
    for (let i = 1; i <= maxRetries; i++) {
        try {
            return await fn(i);
        }
        catch (e) {
            lastError = e;
            if (shouldRetry && !shouldRetry(lastError)) {
                break;
            }
            else if ((opts === null || opts === void 0 ? void 0 : opts.retryDelay) !== undefined) {
                await (0, lodestar_utils_1.sleep)(opts === null || opts === void 0 ? void 0 : opts.retryDelay);
            }
        }
    }
    throw lastError;
}
exports.retry = retry;
//# sourceMappingURL=retry.js.map