import { Slot, ValidatorIndex } from "@chainsafe/lodestar-types";
/**
 * Keeps a cache to filter block proposals from the same validator in the same slot.
 *
 * This cache is not bounded and for extremely long periods of non-finality it can grow a lot. However it's practically
 * limited by the possible shufflings in those epochs, and the stored data is very cheap
 */
export declare class SeenBlockProposers {
    private readonly proposerIndexesBySlot;
    private finalizedSlot;
    isKnown(blockSlot: Slot, proposerIndex: ValidatorIndex): boolean;
    add(blockSlot: Slot, proposerIndex: ValidatorIndex): void;
    prune(finalizedSlot: Slot): void;
}
//# sourceMappingURL=seenBlockProposers.d.ts.map