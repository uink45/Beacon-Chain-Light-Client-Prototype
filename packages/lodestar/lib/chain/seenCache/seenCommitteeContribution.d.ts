import { Slot, ValidatorIndex } from "@chainsafe/lodestar-types";
/**
 * Cache SyncCommitteeContribution and seen ContributionAndProof.
 * This is used for SignedContributionAndProof validation and block factory.
 * This stays in-memory and should be pruned per slot.
 */
export declare class SeenContributionAndProof {
    private readonly seenCacheBySlot;
    /**
     * Gossip validation requires to check:
     * The sync committee contribution is the first valid contribution received for the aggregator with index
     * contribution_and_proof.aggregator_index for the slot contribution.slot and subcommittee index contribution.subcommittee_index.
     */
    isKnown(slot: Slot, subcommitteeIndex: number, aggregatorIndex: ValidatorIndex): boolean;
    /** Register item as seen in the cache */
    add(slot: Slot, subcommitteeIndex: number, aggregatorIndex: ValidatorIndex): void;
    /** Prune per head slot */
    prune(headSlot: Slot): void;
}
//# sourceMappingURL=seenCommitteeContribution.d.ts.map