import { CachedBeaconStateAllForks, allForks } from "@chainsafe/lodestar-beacon-state-transition";
import { phase0, ValidatorIndex } from "@chainsafe/lodestar-types";
import { IBeaconDb } from "../../db";
export declare class OpPool {
    /** Map of uniqueId(AttesterSlashing) -> AttesterSlashing */
    private readonly attesterSlashings;
    /** Map of to slash validator index -> ProposerSlashing */
    private readonly proposerSlashings;
    /** Map of to exit validator index -> SignedVoluntaryExit */
    private readonly voluntaryExits;
    /** Set of seen attester slashing indexes. No need to prune */
    private readonly attesterSlashingIndexes;
    fromPersisted(db: IBeaconDb): Promise<void>;
    toPersisted(db: IBeaconDb): Promise<void>;
    /** Returns false if at least one intersecting index has not been seen yet */
    hasSeenAttesterSlashing(intersectingIndices: ValidatorIndex[]): boolean;
    hasSeenVoluntaryExit(validatorIndex: ValidatorIndex): boolean;
    hasSeenProposerSlashing(validatorIndex: ValidatorIndex): boolean;
    /** Must be validated beforehand */
    insertAttesterSlashing(attesterSlashing: phase0.AttesterSlashing, rootHash?: Uint8Array): void;
    /** Must be validated beforehand */
    insertProposerSlashing(proposerSlashing: phase0.ProposerSlashing): void;
    /** Must be validated beforehand */
    insertVoluntaryExit(voluntaryExit: phase0.SignedVoluntaryExit): void;
    /**
     * Get proposer and attester slashings and voluntary exits for inclusion in a block.
     *
     * This function computes both types of slashings and exits, because attester slashings and exits may be invalidated by
     * slashings included earlier in the block.
     */
    getSlashingsAndExits(state: CachedBeaconStateAllForks): [phase0.AttesterSlashing[], phase0.ProposerSlashing[], phase0.SignedVoluntaryExit[]];
    /** For beacon pool API */
    getAllAttesterSlashings(): phase0.AttesterSlashing[];
    /** For beacon pool API */
    getAllProposerSlashings(): phase0.ProposerSlashing[];
    /** For beacon pool API */
    getAllVoluntaryExits(): phase0.SignedVoluntaryExit[];
    /**
     * Prune all types of transactions given the latest head state
     */
    pruneAll(headState: allForks.BeaconState): void;
    /**
     * Prune attester slashings for all slashed or withdrawn validators.
     */
    private pruneAttesterSlashings;
    /**
     * Prune proposer slashings for validators which are exited in the finalized epoch.
     */
    private pruneProposerSlashings;
    /**
     * Call after finalizing
     * Prune if validator has already exited at or before the finalized checkpoint of the head.
     */
    private pruneVoluntaryExits;
}
//# sourceMappingURL=opPool.d.ts.map