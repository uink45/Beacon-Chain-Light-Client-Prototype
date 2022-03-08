"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneBySlot = void 0;
/**
 * Prune a Map indexed by slot to keep the most recent slots, up to `slotsRetained`
 */
function pruneBySlot(map, slot, slotsRetained) {
    const lowestPermissibleSlot = Math.max(slot - slotsRetained, 0);
    // No need to prune if the lowest permissible slot has not changed and the queue length is less than the maximum
    if (map.size <= slotsRetained) {
        return lowestPermissibleSlot;
    }
    // Remove the oldest slots to keep a max of `slotsRetained` slots
    const slots = Array.from(map.keys());
    const slotsToDelete = slots.sort((a, b) => b - a).slice(slotsRetained);
    for (const slot of slotsToDelete) {
        map.delete(slot);
    }
    return lowestPermissibleSlot;
}
exports.pruneBySlot = pruneBySlot;
//# sourceMappingURL=utils.js.map