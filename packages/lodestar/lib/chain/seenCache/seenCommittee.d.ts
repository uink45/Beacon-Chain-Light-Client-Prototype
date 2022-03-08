import { SubcommitteeIndex, Slot, ValidatorIndex } from "@chainsafe/lodestar-types";
/**
 * Cache seen SyncCommitteeMessage by slot + validator index.
 */
export declare class SeenSyncCommitteeMessages {
    private readonly seenCacheBySlot;
    /**
     * based on slot + validator index
     */
    isKnown(slot: Slot, subnet: SubcommitteeIndex, validatorIndex: ValidatorIndex): boolean;
    /** Register item as seen in the cache */
    add(slot: Slot, subnet: SubcommitteeIndex, validatorIndex: ValidatorIndex): void;
    /** Prune per clock slot */
    prune(clockSlot: Slot): void;
}
//# sourceMappingURL=seenCommittee.d.ts.map