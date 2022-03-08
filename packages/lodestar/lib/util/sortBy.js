"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortBy = void 0;
/**
 * Sort by multiple prioritized conditions
 * - Sort is stable
 * - Sort does not mutate the original array
 * - Sorts by number in ascending order: [-1,0,1,2]
 * @param condition Must return an number, used to sort compare each item
 * - conditions[0] has priority over conditions[1]
 */
function sortBy(arr, ...conditions) {
    return [...arr].sort((a, b) => {
        for (const condition of conditions) {
            const ca = condition(a);
            const cb = condition(b);
            if (ca > cb)
                return 1;
            if (ca < cb)
                return -1;
        }
        return 0;
    });
}
exports.sortBy = sortBy;
//# sourceMappingURL=sortBy.js.map