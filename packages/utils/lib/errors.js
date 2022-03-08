"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isErrorAborted = exports.TimeoutError = exports.ErrorAborted = exports.LodestarError = void 0;
/**
 * Generic Lodestar error with attached metadata
 */
class LodestarError extends Error {
    constructor(type, message) {
        super(message || type.code);
        this.type = type;
    }
    getMetadata() {
        return this.type;
    }
    /**
     * Get the metadata and the stacktrace for the error.
     */
    toObject() {
        return {
            // Ignore message since it's just type.code
            ...this.getMetadata(),
            stack: this.stack || "",
        };
    }
}
exports.LodestarError = LodestarError;
/**
 * Throw this error when an upstream abort signal aborts
 */
class ErrorAborted extends Error {
    constructor(message) {
        super(`Aborted ${message || ""}`);
    }
}
exports.ErrorAborted = ErrorAborted;
/**
 * Throw this error when wrapped timeout expires
 */
class TimeoutError extends Error {
    constructor(message) {
        super(`Timeout ${message || ""}`);
    }
}
exports.TimeoutError = TimeoutError;
/**
 * Returns true if arg `e` is an instance of `ErrorAborted`
 */
function isErrorAborted(e) {
    return e instanceof ErrorAborted;
}
exports.isErrorAborted = isErrorAborted;
//# sourceMappingURL=errors.js.map