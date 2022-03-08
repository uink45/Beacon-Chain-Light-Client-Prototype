"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUndefinedRecursive = void 0;
/**
 * Removes (mutates) all properties with a value === undefined, recursively
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeUndefinedRecursive(obj) {
    for (const key of Object.keys(obj)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = obj[key];
        if (value && typeof value === "object")
            removeUndefinedRecursive(value);
        else if (value === undefined)
            delete obj[key];
    }
    return obj;
}
exports.removeUndefinedRecursive = removeUndefinedRecursive;
//# sourceMappingURL=object.js.map