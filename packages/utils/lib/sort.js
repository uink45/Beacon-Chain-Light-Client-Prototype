"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSorted = void 0;
function isSorted(indices) {
    for (let i = 0, prevIndex = -1; i < indices.length; i++) {
        if (indices[i] <= prevIndex) {
            return false;
        }
        prevIndex = indices[i];
    }
    return true;
}
exports.isSorted = isSorted;
//# sourceMappingURL=sort.js.map