"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripOffNewlines = void 0;
/**
 * Remove trailing new lines '\n' or '\r' if any
 */
function stripOffNewlines(s) {
    return s.replace(/[\n|\r]+$/g, "");
}
exports.stripOffNewlines = stripOffNewlines;
//# sourceMappingURL=stripOffNewlines.js.map