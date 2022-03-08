import { BitList } from "@chainsafe/ssz";
import { BLSSignature, CommitteeIndex, Epoch, Slot, ValidatorIndex, phase0, allForks, Number64, SyncPeriod } from "@chainsafe/lodestar-types";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { LodestarError } from "@chainsafe/lodestar-utils";
import { IEpochShuffling } from "../util/epochShuffling";
import { EffectiveBalanceIncrements } from "./effectiveBalanceIncrements";
import { Index2PubkeyCache, PubkeyIndexMap } from "./pubkeyCache";
import { SyncCommitteeCache } from "./syncCommitteeCache";
/** `= PROPOSER_WEIGHT / (WEIGHT_DENOMINATOR - PROPOSER_WEIGHT)` */
export declare const PROPOSER_WEIGHT_FACTOR: number;
export declare type EpochContextOpts = {
    pubkey2index?: PubkeyIndexMap;
    index2pubkey?: Index2PubkeyCache;
    skipSyncPubkeys?: boolean;
    skipSyncCommitteeCache?: boolean;
};
/**
 * EpochContext is the parent object of:
 * - Any data-structures not part of the spec'ed BeaconState
 * - Necessary to only compute data once
 * - Must be kept at all times through an epoch
 *
 * The performance gains with EpochContext are fundamental for the BeaconNode to be able to participate in a
 * production network with 100_000s of validators. In summary, it contains:
 *
 * Expensive data constant through the epoch:
 * - pubkey cache
 * - proposer indexes
 * - shufflings
 * - sync committee indexed
 * Counters (maybe) mutated through the epoch:
 * - churnLimit
 * - exitQueueEpoch
 * - exitQueueChurn
 * Time data faster than recomputing from the state:
 * - epoch
 * - syncPeriod
 **/
export declare class EpochContext {
    config: IBeaconConfig;
    /**
     * Unique globally shared pubkey registry. There should only exist one for the entire application.
     *
     * TODO: this is a hack, we need a safety mechanism in case a bad eth1 majority vote is in,
     * or handle non finalized data differently, or use an immutable.js structure for cheap copies
     * Warning: may contain pubkeys that do not yet exist in the current state, but do in a later processed state.
     *
     * $VALIDATOR_COUNT x 192 char String -> Number Map
     */
    pubkey2index: PubkeyIndexMap;
    /**
     * Unique globally shared pubkey registry. There should only exist one for the entire application.
     *
     * Warning: may contain indices that do not yet exist in the current state, but do in a later processed state.
     *
     * $VALIDATOR_COUNT x BLST deserialized pubkey (Jacobian coordinates)
     */
    index2pubkey: Index2PubkeyCache;
    /**
     * Indexes of the block proposers for the current epoch.
     *
     * 32 x Number
     */
    proposers: ValidatorIndex[];
    /**
     * Shuffling of validator indexes. Immutable through the epoch, then it's replaced entirely.
     * Note: Per spec definition, shuffling will always be defined. They are never called before loadState()
     *
     * $VALIDATOR_COUNT x Number
     */
    previousShuffling: IEpochShuffling;
    /** Same as previousShuffling */
    currentShuffling: IEpochShuffling;
    /** Same as previousShuffling */
    nextShuffling: IEpochShuffling;
    /**
     * Effective balances, for altair processAttestations()
     */
    effectiveBalanceIncrements: EffectiveBalanceIncrements;
    syncParticipantReward: number;
    syncProposerReward: number;
    /**
     * Update freq: once per epoch after `process_effective_balance_updates()`
     */
    baseRewardPerIncrement: number;
    /**
     * Total active balance for current epoch, to be used instead of getTotalBalance()
     */
    totalActiveBalanceIncrements: number;
    /**
     * Rate at which validators can enter or leave the set per epoch. Depends only on activeIndexes, so it does not
     * change through the epoch. It's used in initiateValidatorExit(). Must be update after changing active indexes.
     */
    churnLimit: number;
    /**
     * Closest epoch with available churn for validators to exit at. May be updated every block as validators are
     * initiateValidatorExit(). This value may vary on each fork of the state.
     *
     * NOTE: Changes block to block
     */
    exitQueueEpoch: Epoch;
    /**
     * Number of validators initiating an exit at exitQueueEpoch. May be updated every block as validators are
     * initiateValidatorExit(). This value may vary on each fork of the state.
     *
     * NOTE: Changes block to block
     */
    exitQueueChurn: number;
    /**
     * Returns a SyncCommitteeCache. (Note: phase0 has no sync committee, and returns an empty cache)
     * - validatorIndices (of the committee members)
     * - validatorIndexMap: Map of ValidatorIndex -> syncCommitteeIndexes
     *
     * The syncCommittee is immutable and changes as a whole every ~ 27h.
     * It contains fixed 512 members so it's rather small.
     */
    currentSyncCommitteeIndexed: SyncCommitteeCache;
    /** Same as currentSyncCommitteeIndexed */
    nextSyncCommitteeIndexed: SyncCommitteeCache;
    epoch: Epoch;
    syncPeriod: SyncPeriod;
    constructor(data: {
        config: IBeaconConfig;
        pubkey2index: PubkeyIndexMap;
        index2pubkey: Index2PubkeyCache;
        proposers: number[];
        previousShuffling: IEpochShuffling;
        currentShuffling: IEpochShuffling;
        nextShuffling: IEpochShuffling;
        effectiveBalanceIncrements: EffectiveBalanceIncrements;
        syncParticipantReward: number;
        syncProposerReward: number;
        baseRewardPerIncrement: number;
        totalActiveBalanceIncrements: number;
        churnLimit: number;
        exitQueueEpoch: Epoch;
        exitQueueChurn: number;
        currentSyncCommitteeIndexed: SyncCommitteeCache;
        nextSyncCommitteeIndexed: SyncCommitteeCache;
        epoch: Epoch;
        syncPeriod: SyncPeriod;
    });
    /**
     * Create an epoch cache
     * @param validators cached validators that matches `state.validators`
     *
     * SLOW CODE - 🐢
     */
    static createFromState(config: IBeaconConfig, state: allForks.BeaconState, opts?: EpochContextOpts): EpochContext;
    /**
     * Copies a given EpochContext while avoiding copying its immutable parts.
     */
    copy(): EpochContext;
    /**
     * Called to re-use information, such as the shuffling of the next epoch, after transitioning into a
     * new epoch.
     */
    afterProcessEpoch(state: allForks.BeaconState, epochProcess: {
        nextEpochShufflingActiveValidatorIndices: ValidatorIndex[];
        nextEpochTotalActiveBalanceByIncrement: number;
    }): void;
    beforeEpochTransition(): void;
    /**
     * Return the beacon committee at slot for index.
     */
    getBeaconCommittee(slot: Slot, index: CommitteeIndex): ValidatorIndex[];
    getCommitteeCountPerSlot(epoch: Epoch): number;
    getBeaconProposer(slot: Slot): ValidatorIndex;
    /**
     * Return the indexed attestation corresponding to ``attestation``.
     */
    getIndexedAttestation(attestation: phase0.Attestation): phase0.IndexedAttestation;
    getAttestingIndices(data: phase0.AttestationData, bits: BitList): ValidatorIndex[];
    getCommitteeAssignments(epoch: Epoch, requestedValidatorIndices: ValidatorIndex[]): Map<ValidatorIndex, AttesterDuty>;
    /**
     * Return the committee assignment in the ``epoch`` for ``validator_index``.
     * ``assignment`` returned is a tuple of the following form:
     * ``assignment[0]`` is the list of validators in the committee
     * ``assignment[1]`` is the index to which the committee is assigned
     * ``assignment[2]`` is the slot at which the committee is assigned
     * Return null if no assignment..
     */
    getCommitteeAssignment(epoch: Epoch, validatorIndex: ValidatorIndex): phase0.CommitteeAssignment | null;
    isAggregator(slot: Slot, index: CommitteeIndex, slotSignature: BLSSignature): boolean;
    addPubkey(index: ValidatorIndex, pubkey: Uint8Array): void;
    getShufflingAtSlot(slot: Slot): IEpochShuffling;
    getShufflingAtEpoch(epoch: Epoch): IEpochShuffling;
    effectiveBalanceIncrementsSet(index: number, effectiveBalance: number): void;
    /**
     * Note: The range of slots a validator has to perform duties is off by one.
     * The previous slot wording means that if your validator is in a sync committee for a period that runs from slot
     * 100 to 200,then you would actually produce signatures in slot 99 - 199.
     */
    getIndexedSyncCommittee(slot: Slot): SyncCommitteeCache;
    /**
     * **DO NOT USE FOR GOSSIP VALIDATION**: Sync committee duties are offset by one slot. @see {@link EpochContext.getIndexedSyncCommittee}
     *
     * Get indexed sync committee at epoch without offsets
     */
    getIndexedSyncCommitteeAtEpoch(epoch: Epoch): SyncCommitteeCache;
    /** On processSyncCommitteeUpdates rotate next to current and set nextSyncCommitteeIndexed */
    rotateSyncCommitteeIndexed(nextSyncCommitteeIndices: number[]): void;
}
declare type AttesterDuty = {
    validatorIndex: ValidatorIndex;
    committeeIndex: CommitteeIndex;
    committeeLength: Number64;
    committeesAtSlot: Number64;
    validatorCommitteeIndex: Number64;
    slot: Slot;
};
export declare enum EpochContextErrorCode {
    COMMITTEE_INDEX_OUT_OF_RANGE = "EPOCH_CONTEXT_ERROR_COMMITTEE_INDEX_OUT_OF_RANGE"
}
declare type EpochContextErrorType = {
    code: EpochContextErrorCode.COMMITTEE_INDEX_OUT_OF_RANGE;
    index: number;
    maxIndex: number;
};
export declare class EpochContextError extends LodestarError<EpochContextErrorType> {
}
export {};
//# sourceMappingURL=epochContext.d.ts.map