import { Epoch, ValidatorIndex, allForks } from "@chainsafe/lodestar-types";
export interface IEpochShuffling {
    /**
     * Epoch being shuffled
     */
    epoch: Epoch;
    /**
     * Non-shuffled active validator indices
     */
    activeIndices: ValidatorIndex[];
    /**
     * The active validator indices, shuffled into their committee
     */
    shuffling: ValidatorIndex[];
    /**
     * List of list of committees Committees
     *
     * Committees by index, by slot
     *
     * Note: With a high amount of shards, or low amount of validators,
     * some shards may not have a committee this epoch
     */
    committees: ValidatorIndex[][][];
    /**
     * Committees per slot, for fast attestation verification
     */
    committeesPerSlot: number;
}
export declare function computeCommitteeCount(activeValidatorCount: number): number;
export declare function computeEpochShuffling(state: allForks.BeaconState, activeIndices: ValidatorIndex[], epoch: Epoch): IEpochShuffling;
//# sourceMappingURL=epochShuffling.d.ts.map