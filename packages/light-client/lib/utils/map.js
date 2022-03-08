"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneSetToMax = void 0;
/**
 * Prune an arbitrary set removing the first keys to have a set.size === maxItems.
 * Returns the count of deleted items.
 */
function pruneSetToMax(set, maxItems) {
    let itemsToDelete = set.size - maxItems;
    const deletedItems = Math.max(0, itemsToDelete);
    if (itemsToDelete > 0) {
        for (const key of set.keys()) {
            set.delete(key);
            itemsToDelete--;
            if (itemsToDelete <= 0) {
                break;
            }
        }
    }
    return deletedItems;
}
exports.pruneSetToMax = pruneSetToMax;
//# sourceMappingURL=map.js.map