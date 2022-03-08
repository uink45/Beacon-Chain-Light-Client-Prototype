"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendError = void 0;
/**
 * Extend an existing error by appending a string to its `e.message`
 */
function extendError(e, prependMessage) {
    e.message = `${prependMessage} - ${e.message}`;
    return e;
}
exports.extendError = extendError;
//# sourceMappingURL=error.js.map