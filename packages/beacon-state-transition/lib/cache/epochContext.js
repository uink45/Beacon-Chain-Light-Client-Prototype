"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpochContextError = exports.EpochContextErrorCode = exports.EpochContext = exports.PROPOSER_WEIGHT_FACTOR = void 0;
const ssz_1 = require("@chainsafe/ssz");
const bls_1 = __importStar(require("@chainsafe/bls"));
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const util_1 = require("../util");
const epochShuffling_1 = require("../util/epochShuffling");
const effectiveBalanceIncrements_1 = require("./effectiveBalanceIncrements");
const pubkeyCache_1 = require("./pubkeyCache");
const syncCommitteeCache_1 = require("./syncCommitteeCache");
const syncCommittee_1 = require("../util/syncCommittee");
/** `= PROPOSER_WEIGHT / (WEIGHT_DENOMINATOR - PROPOSER_WEIGHT)` */
exports.PROPOSER_WEIGHT_FACTOR = lodestar_params_1.PROPOSER_WEIGHT / (lodestar_params_1.WEIGHT_DENOMINATOR - lodestar_params_1.PROPOSER_WEIGHT);
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
class EpochContext {
    constructor(data) {
        this.config = data.config;
        this.pubkey2index = data.pubkey2index;
        this.index2pubkey = data.index2pubkey;
        this.proposers = data.proposers;
        this.previousShuffling = data.previousShuffling;
        this.currentShuffling = data.currentShuffling;
        this.nextShuffling = data.nextShuffling;
        this.effectiveBalanceIncrements = data.effectiveBalanceIncrements;
        this.syncParticipantReward = data.syncParticipantReward;
        this.syncProposerReward = data.syncProposerReward;
        this.baseRewardPerIncrement = data.baseRewardPerIncrement;
        this.totalActiveBalanceIncrements = data.totalActiveBalanceIncrements;
        this.churnLimit = data.churnLimit;
        this.exitQueueEpoch = data.exitQueueEpoch;
        this.exitQueueChurn = data.exitQueueChurn;
        this.currentSyncCommitteeIndexed = data.currentSyncCommitteeIndexed;
        this.nextSyncCommitteeIndexed = data.nextSyncCommitteeIndexed;
        this.epoch = data.epoch;
        this.syncPeriod = data.syncPeriod;
    }
    /**
     * Create an epoch cache
     * @param validators cached validators that matches `state.validators`
     *
     * SLOW CODE - 🐢
     */
    static createFromState(config, state, opts) {
        const pubkey2index = (opts === null || opts === void 0 ? void 0 : opts.pubkey2index) || new pubkeyCache_1.PubkeyIndexMap();
        const index2pubkey = (opts === null || opts === void 0 ? void 0 : opts.index2pubkey) || [];
        if (!(opts === null || opts === void 0 ? void 0 : opts.skipSyncPubkeys)) {
            (0, pubkeyCache_1.syncPubkeys)(state, pubkey2index, index2pubkey);
        }
        const currentEpoch = (0, util_1.computeEpochAtSlot)(state.slot);
        const isGenesis = currentEpoch === lodestar_params_1.GENESIS_EPOCH;
        const previousEpoch = isGenesis ? lodestar_params_1.GENESIS_EPOCH : currentEpoch - 1;
        const nextEpoch = currentEpoch + 1;
        let totalActiveBalanceIncrements = 0;
        let exitQueueEpoch = (0, util_1.computeActivationExitEpoch)(currentEpoch);
        let exitQueueChurn = 0;
        const validators = (0, ssz_1.readonlyValuesListOfLeafNodeStruct)(state.validators);
        const validatorCount = validators.length;
        const effectiveBalanceIncrements = (0, effectiveBalanceIncrements_1.getEffectiveBalanceIncrementsWithLen)(validatorCount);
        const previousActiveIndices = [];
        const currentActiveIndices = [];
        const nextActiveIndices = [];
        for (let i = 0; i < validatorCount; i++) {
            const validator = validators[i];
            // Note: Not usable for fork-choice balances since in-active validators are not zero'ed
            effectiveBalanceIncrements[i] = Math.floor(validator.effectiveBalance / lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT);
            if ((0, util_1.isActiveValidator)(validator, previousEpoch)) {
                previousActiveIndices.push(i);
            }
            if ((0, util_1.isActiveValidator)(validator, currentEpoch)) {
                currentActiveIndices.push(i);
                // We track totalActiveBalanceIncrements as ETH to fit total network balance in a JS number (53 bits)
                totalActiveBalanceIncrements += effectiveBalanceIncrements[i];
            }
            if ((0, util_1.isActiveValidator)(validator, nextEpoch)) {
                nextActiveIndices.push(i);
            }
            const { exitEpoch } = validator;
            if (exitEpoch !== lodestar_params_1.FAR_FUTURE_EPOCH) {
                if (exitEpoch > exitQueueEpoch) {
                    exitQueueEpoch = exitEpoch;
                    exitQueueChurn = 1;
                }
                else if (exitEpoch === exitQueueEpoch) {
                    exitQueueChurn += 1;
                }
            }
        }
        // Spec: `EFFECTIVE_BALANCE_INCREMENT` Gwei minimum to avoid divisions by zero
        // 1 = 1 unit of EFFECTIVE_BALANCE_INCREMENT
        if (totalActiveBalanceIncrements < 1) {
            totalActiveBalanceIncrements = 1;
        }
        else if (totalActiveBalanceIncrements >= Number.MAX_SAFE_INTEGER) {
            throw Error("totalActiveBalanceIncrements >= Number.MAX_SAFE_INTEGER. MAX_EFFECTIVE_BALANCE is too low.");
        }
        const currentShuffling = (0, epochShuffling_1.computeEpochShuffling)(state, currentActiveIndices, currentEpoch);
        const previousShuffling = isGenesis
            ? currentShuffling
            : (0, epochShuffling_1.computeEpochShuffling)(state, previousActiveIndices, previousEpoch);
        const nextShuffling = (0, epochShuffling_1.computeEpochShuffling)(state, nextActiveIndices, nextEpoch);
        // Allow to create CachedBeaconState for empty states
        const proposers = state.validators.length > 0 ? (0, util_1.computeProposers)(state, currentShuffling, effectiveBalanceIncrements) : [];
        // Only after altair, compute the indices of the current sync committee
        const afterAltairFork = currentEpoch >= config.ALTAIR_FORK_EPOCH;
        // Values syncParticipantReward, syncProposerReward, baseRewardPerIncrement are only used after altair.
        // However, since they are very cheap to compute they are computed always to simplify upgradeState function.
        const syncParticipantReward = (0, syncCommittee_1.computeSyncParticipantReward)(totalActiveBalanceIncrements);
        const syncProposerReward = Math.floor(syncParticipantReward * exports.PROPOSER_WEIGHT_FACTOR);
        const baseRewardPerIncrement = (0, syncCommittee_1.computeBaseRewardPerIncrement)(totalActiveBalanceIncrements);
        let currentSyncCommitteeIndexed;
        let nextSyncCommitteeIndexed;
        // Allow to skip populating sync committee for initializeBeaconStateFromEth1()
        if (afterAltairFork && !(opts === null || opts === void 0 ? void 0 : opts.skipSyncCommitteeCache)) {
            const altairState = state;
            currentSyncCommitteeIndexed = (0, syncCommitteeCache_1.computeSyncCommitteeCache)(altairState.currentSyncCommittee, pubkey2index);
            nextSyncCommitteeIndexed = (0, syncCommitteeCache_1.computeSyncCommitteeCache)(altairState.nextSyncCommittee, pubkey2index);
        }
        else {
            currentSyncCommitteeIndexed = new syncCommitteeCache_1.SyncCommitteeCacheEmpty();
            nextSyncCommitteeIndexed = new syncCommitteeCache_1.SyncCommitteeCacheEmpty();
        }
        // Precompute churnLimit for efficient initiateValidatorExit() during block proposing MUST be recompute everytime the
        // active validator indices set changes in size. Validators change active status only when:
        // - validator.activation_epoch is set. Only changes in process_registry_updates() if validator can be activated. If
        //   the value changes it will be set to `epoch + 1 + MAX_SEED_LOOKAHEAD`.
        // - validator.exit_epoch is set. Only changes in initiate_validator_exit() if validator exits. If the value changes,
        //   it will be set to at least `epoch + 1 + MAX_SEED_LOOKAHEAD`.
        // ```
        // is_active_validator = validator.activation_epoch <= epoch < validator.exit_epoch
        // ```
        // So the returned value of is_active_validator(epoch) is guaranteed to not change during `MAX_SEED_LOOKAHEAD` epochs.
        //
        // activeIndices size is dependant on the state epoch. The epoch is advanced after running the epoch transition, and
        // the first block of the epoch process_block() call. So churnLimit must be computed at the end of the before epoch
        // transition and the result is valid until the end of the next epoch transition
        const churnLimit = (0, util_1.getChurnLimit)(config, currentShuffling.activeIndices.length);
        if (exitQueueChurn >= churnLimit) {
            exitQueueEpoch += 1;
            exitQueueChurn = 0;
        }
        return new EpochContext({
            config,
            pubkey2index,
            index2pubkey,
            proposers,
            previousShuffling,
            currentShuffling,
            nextShuffling,
            effectiveBalanceIncrements,
            syncParticipantReward,
            syncProposerReward,
            baseRewardPerIncrement,
            totalActiveBalanceIncrements: totalActiveBalanceIncrements,
            churnLimit,
            exitQueueEpoch,
            exitQueueChurn,
            currentSyncCommitteeIndexed,
            nextSyncCommitteeIndexed,
            epoch: currentEpoch,
            syncPeriod: (0, util_1.computeSyncPeriodAtEpoch)(currentEpoch),
        });
    }
    /**
     * Copies a given EpochContext while avoiding copying its immutable parts.
     */
    copy() {
        // warning: pubkey cache is not copied, it is shared, as eth1 is not expected to reorder validators.
        // Shallow copy all data from current epoch context to the next
        // All data is completely replaced, or only-appended
        return new EpochContext({
            config: this.config,
            // Common append-only structures shared with all states, no need to clone
            pubkey2index: this.pubkey2index,
            index2pubkey: this.index2pubkey,
            // Immutable data
            proposers: this.proposers,
            previousShuffling: this.previousShuffling,
            currentShuffling: this.currentShuffling,
            nextShuffling: this.nextShuffling,
            // Uint8Array, requires cloning, but it is cloned only when necessary before an epoch transition
            // See EpochContext.beforeEpochTransition()
            effectiveBalanceIncrements: this.effectiveBalanceIncrements,
            // Basic types (numbers) cloned implicitly
            syncParticipantReward: this.syncParticipantReward,
            syncProposerReward: this.syncProposerReward,
            baseRewardPerIncrement: this.baseRewardPerIncrement,
            totalActiveBalanceIncrements: this.totalActiveBalanceIncrements,
            churnLimit: this.churnLimit,
            exitQueueEpoch: this.exitQueueEpoch,
            exitQueueChurn: this.exitQueueChurn,
            currentSyncCommitteeIndexed: this.currentSyncCommitteeIndexed,
            nextSyncCommitteeIndexed: this.nextSyncCommitteeIndexed,
            epoch: this.epoch,
            syncPeriod: this.syncPeriod,
        });
    }
    /**
     * Called to re-use information, such as the shuffling of the next epoch, after transitioning into a
     * new epoch.
     */
    afterProcessEpoch(state, epochProcess) {
        this.previousShuffling = this.currentShuffling;
        this.currentShuffling = this.nextShuffling;
        const currEpoch = this.currentShuffling.epoch;
        const nextEpoch = currEpoch + 1;
        this.nextShuffling = (0, epochShuffling_1.computeEpochShuffling)(state, epochProcess.nextEpochShufflingActiveValidatorIndices, nextEpoch);
        this.proposers = (0, util_1.computeProposers)(state, this.currentShuffling, this.effectiveBalanceIncrements);
        // TODO: DEDUPLICATE from createEpochContext
        //
        // Precompute churnLimit for efficient initiateValidatorExit() during block proposing MUST be recompute everytime the
        // active validator indices set changes in size. Validators change active status only when:
        // - validator.activation_epoch is set. Only changes in process_registry_updates() if validator can be activated. If
        //   the value changes it will be set to `epoch + 1 + MAX_SEED_LOOKAHEAD`.
        // - validator.exit_epoch is set. Only changes in initiate_validator_exit() if validator exits. If the value changes,
        //   it will be set to at least `epoch + 1 + MAX_SEED_LOOKAHEAD`.
        // ```
        // is_active_validator = validator.activation_epoch <= epoch < validator.exit_epoch
        // ```
        // So the returned value of is_active_validator(epoch) is guaranteed to not change during `MAX_SEED_LOOKAHEAD` epochs.
        //
        // activeIndices size is dependant on the state epoch. The epoch is advanced after running the epoch transition, and
        // the first block of the epoch process_block() call. So churnLimit must be computed at the end of the before epoch
        // transition and the result is valid until the end of the next epoch transition
        this.churnLimit = (0, util_1.getChurnLimit)(this.config, this.currentShuffling.activeIndices.length);
        // Maybe advance exitQueueEpoch at the end of the epoch if there haven't been any exists for a while
        const exitQueueEpoch = (0, util_1.computeActivationExitEpoch)(currEpoch);
        if (exitQueueEpoch > this.exitQueueEpoch) {
            this.exitQueueEpoch = exitQueueEpoch;
            this.exitQueueChurn = 0;
        }
        this.totalActiveBalanceIncrements = epochProcess.nextEpochTotalActiveBalanceByIncrement;
        if (currEpoch >= this.config.ALTAIR_FORK_EPOCH) {
            this.syncParticipantReward = (0, syncCommittee_1.computeSyncParticipantReward)(this.totalActiveBalanceIncrements);
            this.syncProposerReward = Math.floor(this.syncParticipantReward * exports.PROPOSER_WEIGHT_FACTOR);
            this.baseRewardPerIncrement = (0, syncCommittee_1.computeBaseRewardPerIncrement)(this.totalActiveBalanceIncrements);
        }
        // Advance time units
        // state.slot is advanced right before calling this function
        // ```
        // postState.slot++;
        // afterProcessEpoch(postState, epochProcess);
        // ```
        this.epoch = (0, util_1.computeEpochAtSlot)(state.slot);
        this.syncPeriod = (0, util_1.computeSyncPeriodAtEpoch)(this.epoch);
    }
    beforeEpochTransition() {
        // Clone before being mutated in processEffectiveBalanceUpdates
        this.effectiveBalanceIncrements = this.effectiveBalanceIncrements.slice(0);
    }
    /**
     * Return the beacon committee at slot for index.
     */
    getBeaconCommittee(slot, index) {
        const slotCommittees = this.getShufflingAtSlot(slot).committees[slot % lodestar_params_1.SLOTS_PER_EPOCH];
        if (index >= slotCommittees.length) {
            throw new EpochContextError({
                code: EpochContextErrorCode.COMMITTEE_INDEX_OUT_OF_RANGE,
                index,
                maxIndex: slotCommittees.length,
            });
        }
        return slotCommittees[index];
    }
    getCommitteeCountPerSlot(epoch) {
        return this.getShufflingAtEpoch(epoch).committeesPerSlot;
    }
    getBeaconProposer(slot) {
        const epoch = (0, util_1.computeEpochAtSlot)(slot);
        if (epoch !== this.currentShuffling.epoch) {
            throw new Error(`Requesting beacon proposer for different epoch current shuffling: ${epoch} != ${this.currentShuffling.epoch}`);
        }
        return this.proposers[slot % lodestar_params_1.SLOTS_PER_EPOCH];
    }
    /**
     * Return the indexed attestation corresponding to ``attestation``.
     */
    getIndexedAttestation(attestation) {
        const { aggregationBits, data } = attestation;
        const committeeIndices = this.getBeaconCommittee(data.slot, data.index);
        const attestingIndices = (0, util_1.zipIndexesCommitteeBits)(committeeIndices, aggregationBits);
        // sort in-place
        attestingIndices.sort((a, b) => a - b);
        return {
            attestingIndices: attestingIndices,
            data: data,
            signature: attestation.signature,
        };
    }
    getAttestingIndices(data, bits) {
        const committeeIndices = this.getBeaconCommittee(data.slot, data.index);
        const validatorIndices = (0, util_1.zipIndexesCommitteeBits)(committeeIndices, bits);
        return validatorIndices;
    }
    getCommitteeAssignments(epoch, requestedValidatorIndices) {
        const requestedValidatorIndicesSet = new Set(requestedValidatorIndices);
        const duties = new Map();
        const epochCommittees = this.getShufflingAtEpoch(epoch).committees;
        for (let epochSlot = 0; epochSlot < lodestar_params_1.SLOTS_PER_EPOCH; epochSlot++) {
            const slotCommittees = epochCommittees[epochSlot];
            for (let i = 0, committeesAtSlot = slotCommittees.length; i < committeesAtSlot; i++) {
                for (let j = 0, committeeLength = slotCommittees[i].length; j < committeeLength; j++) {
                    const validatorIndex = slotCommittees[i][j];
                    if (requestedValidatorIndicesSet.has(validatorIndex)) {
                        // no-non-null-assertion: We know that if index is in set there must exist an entry in the map
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        duties.set(validatorIndex, {
                            validatorIndex,
                            committeeLength,
                            committeesAtSlot,
                            validatorCommitteeIndex: j,
                            committeeIndex: i,
                            slot: epoch * lodestar_params_1.SLOTS_PER_EPOCH + epochSlot,
                        });
                    }
                }
            }
        }
        return duties;
    }
    /**
     * Return the committee assignment in the ``epoch`` for ``validator_index``.
     * ``assignment`` returned is a tuple of the following form:
     * ``assignment[0]`` is the list of validators in the committee
     * ``assignment[1]`` is the index to which the committee is assigned
     * ``assignment[2]`` is the slot at which the committee is assigned
     * Return null if no assignment..
     */
    getCommitteeAssignment(epoch, validatorIndex) {
        if (epoch > this.currentShuffling.epoch + 1) {
            throw Error(`Requesting committee assignment for more than 1 epoch ahead: ${epoch} > ${this.currentShuffling.epoch} + 1`);
        }
        const epochStartSlot = (0, util_1.computeStartSlotAtEpoch)(epoch);
        const committeeCountPerSlot = this.getCommitteeCountPerSlot(epoch);
        for (let slot = epochStartSlot; slot < epochStartSlot + lodestar_params_1.SLOTS_PER_EPOCH; slot++) {
            for (let i = 0; i < committeeCountPerSlot; i++) {
                const committee = this.getBeaconCommittee(slot, i);
                if (committee.includes(validatorIndex)) {
                    return {
                        validators: committee,
                        committeeIndex: i,
                        slot,
                    };
                }
            }
        }
        return null;
    }
    isAggregator(slot, index, slotSignature) {
        const committee = this.getBeaconCommittee(slot, index);
        return (0, util_1.isAggregatorFromCommitteeLength)(committee.length, slotSignature);
    }
    addPubkey(index, pubkey) {
        this.pubkey2index.set(pubkey, index);
        this.index2pubkey[index] = bls_1.default.PublicKey.fromBytes(pubkey, bls_1.CoordType.jacobian); // Optimize for aggregation
    }
    getShufflingAtSlot(slot) {
        const epoch = (0, util_1.computeEpochAtSlot)(slot);
        return this.getShufflingAtEpoch(epoch);
    }
    getShufflingAtEpoch(epoch) {
        if (epoch === this.previousShuffling.epoch) {
            return this.previousShuffling;
        }
        else if (epoch === this.currentShuffling.epoch) {
            return this.currentShuffling;
        }
        else if (epoch === this.nextShuffling.epoch) {
            return this.nextShuffling;
        }
        else {
            throw new Error(`Requesting slot committee out of range epoch: ${epoch} current: ${this.currentShuffling.epoch}`);
        }
    }
    effectiveBalanceIncrementsSet(index, effectiveBalance) {
        if (index >= this.effectiveBalanceIncrements.length) {
            // Clone and extend effectiveBalanceIncrements
            const effectiveBalanceIncrements = this.effectiveBalanceIncrements;
            // Note: getEffectiveBalanceIncrementsWithLen() returns a Uint8Array larger than `index + 1` to reduce copy-ing
            this.effectiveBalanceIncrements = (0, effectiveBalanceIncrements_1.getEffectiveBalanceIncrementsWithLen)(index + 1);
            this.effectiveBalanceIncrements.set(effectiveBalanceIncrements, 0);
        }
        this.effectiveBalanceIncrements[index] = Math.floor(effectiveBalance / lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT);
    }
    /**
     * Note: The range of slots a validator has to perform duties is off by one.
     * The previous slot wording means that if your validator is in a sync committee for a period that runs from slot
     * 100 to 200,then you would actually produce signatures in slot 99 - 199.
     */
    getIndexedSyncCommittee(slot) {
        // See note above for the +1 offset
        return this.getIndexedSyncCommitteeAtEpoch((0, util_1.computeEpochAtSlot)(slot + 1));
    }
    /**
     * **DO NOT USE FOR GOSSIP VALIDATION**: Sync committee duties are offset by one slot. @see {@link EpochContext.getIndexedSyncCommittee}
     *
     * Get indexed sync committee at epoch without offsets
     */
    getIndexedSyncCommitteeAtEpoch(epoch) {
        switch ((0, util_1.computeSyncPeriodAtEpoch)(epoch)) {
            case this.syncPeriod:
                return this.currentSyncCommitteeIndexed;
            case this.syncPeriod + 1:
                return this.nextSyncCommitteeIndexed;
            default:
                throw new Error(`No sync committee for epoch ${epoch}`);
        }
    }
    /** On processSyncCommitteeUpdates rotate next to current and set nextSyncCommitteeIndexed */
    rotateSyncCommitteeIndexed(nextSyncCommitteeIndices) {
        this.currentSyncCommitteeIndexed = this.nextSyncCommitteeIndexed;
        this.nextSyncCommitteeIndexed = (0, syncCommitteeCache_1.getSyncCommitteeCache)(nextSyncCommitteeIndices);
    }
}
exports.EpochContext = EpochContext;
var EpochContextErrorCode;
(function (EpochContextErrorCode) {
    EpochContextErrorCode["COMMITTEE_INDEX_OUT_OF_RANGE"] = "EPOCH_CONTEXT_ERROR_COMMITTEE_INDEX_OUT_OF_RANGE";
})(EpochContextErrorCode = exports.EpochContextErrorCode || (exports.EpochContextErrorCode = {}));
class EpochContextError extends lodestar_utils_1.LodestarError {
}
exports.EpochContextError = EpochContextError;
//# sourceMappingURL=epochContext.js.map