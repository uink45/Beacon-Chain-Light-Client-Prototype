import { Slot } from "@chainsafe/lodestar-types";
/**
 * Prune a Map indexed by slot to keep the most recent slots, up to `slotsRetained`
 */
export declare function pruneBySlot(map: Map<Slot, unknown>, slot: Slot, slotsRetained: Slot): Slot;
//# sourceMappingURL=utils.d.ts.map