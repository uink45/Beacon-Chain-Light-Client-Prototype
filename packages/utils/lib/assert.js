"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssertionError = exports.assert = void 0;
exports.assert = {
    /**
     * Assert condition is true, otherwise throw AssertionError
     */
    true(condition, message) {
        if (!condition) {
            throw new AssertionError(message || "Expect condition to be true");
        }
    },
    /**
     * Assert strict equality
     * ```js
     * actual === expected
     * ```
     */
    equal(actual, expected, message) {
        if (!(actual === expected)) {
            throw new AssertionError(`${message || "Expected values to be equal"}: ${actual} === ${expected}`);
        }
    },
    /**
     * Assert less than or equal
     * ```js
     * left <= right
     * ```
     */
    lte(left, right, message) {
        if (!(left <= right)) {
            throw new AssertionError(`${message || "Expected value to be lte"}: ${left} <= ${right}`);
        }
    },
    /**
     * Assert less than
     * ```js
     * left < right
     * ```
     */
    lt(left, right, message) {
        if (!(left < right)) {
            throw new AssertionError(`${message || "Expected value to be lt"}: ${left} < ${right}`);
        }
    },
    /**
     * Assert greater than or equal
     * ```js
     * left >= right
     * ```
     */
    gte(left, right, message) {
        if (!(left >= right)) {
            throw new AssertionError(`${message || "Expected value to be gte"}: ${left} >= ${right}`);
        }
    },
    /**
     * Assert greater than
     * ```js
     * left > right
     * ```
     */
    gt(left, right, message) {
        if (!(left > right)) {
            throw new AssertionError(`${message || "Expected value to be gt"}: ${left} > ${right}`);
        }
    },
};
class AssertionError extends Error {
}
exports.AssertionError = AssertionError;
AssertionError.code = "ERR_ASSERTION";
//# sourceMappingURL=assert.js.map