"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapError = void 0;
/**
 * Wraps a promise to return either an error or result
 * Useful for SyncChain code that must ensure in a sample code
 * ```ts
 * try {
 *   A()
 * } catch (e) {
 *   B()
 * }
 * ```
 * only EITHER fn A() and fn B() are called, but never both. In the snipped above
 * if A() throws, B() would be called.
 */
async function wrapError(promise) {
    try {
        return { err: null, result: await promise };
    }
    catch (err) {
        return { err: err };
    }
}
exports.wrapError = wrapError;
//# sourceMappingURL=wrapError.js.map