"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeProcessEpoch = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const ssz_1 = require("@chainsafe/ssz");
const util_1 = require("../util");
const attesterStatus_1 = require("../util/attesterStatus");
const processPendingAttestations_1 = require("../phase0/epoch/processPendingAttestations");
const syncCommittee_1 = require("../util/syncCommittee");
function beforeProcessEpoch(state) {
    const { config, epochCtx } = state;
    const forkName = config.getForkName(state.slot);
    const currentEpoch = epochCtx.currentShuffling.epoch;
    const prevEpoch = epochCtx.previousShuffling.epoch;
    // active validator indices for nextShuffling is ready, we want to precalculate for the one after that
    const nextShufflingEpoch = currentEpoch + 2;
    const nextEpoch = currentEpoch + 1;
    const slashingsEpoch = currentEpoch + (0, lodestar_utils_1.intDiv)(lodestar_params_1.EPOCHS_PER_SLASHINGS_VECTOR, 2);
    const indicesToSlash = [];
    const indicesEligibleForActivationQueue = [];
    const indicesEligibleForActivation = [];
    const indicesToEject = [];
    const nextEpochShufflingActiveValidatorIndices = [];
    const isActivePrevEpoch = [];
    const isActiveNextEpoch = [];
    const statuses = [];
    let totalActiveStakeByIncrement = 0;
    // To optimize memory each validator node in `state.validators` is represented with a special node type
    // `BranchNodeStruct` that represents the data as struct internally. This utility grabs the struct data directrly
    // from the nodes without any extra transformation. The returned `validators` array contains native JS objects.
    const validators = (0, ssz_1.readonlyValuesListOfLeafNodeStruct)(state.validators);
    const validatorCount = validators.length;
    // Clone before being mutated in processEffectiveBalanceUpdates
    epochCtx.beforeEpochTransition();
    const effectiveBalancesByIncrements = (0, util_1.newZeroedArray)(validators.length);
    for (let i = 0; i < validatorCount; i++) {
        const validator = validators[i];
        const status = (0, attesterStatus_1.createIAttesterStatus)();
        if (validator.slashed) {
            if (slashingsEpoch === validator.withdrawableEpoch) {
                indicesToSlash.push(i);
            }
        }
        else {
            status.flags |= attesterStatus_1.FLAG_UNSLASHED;
        }
        const activePrev = (0, util_1.isActiveValidator)(validator, prevEpoch);
        isActivePrevEpoch.push(activePrev);
        if (activePrev || (validator.slashed && prevEpoch + 1 < validator.withdrawableEpoch)) {
            status.flags |= attesterStatus_1.FLAG_ELIGIBLE_ATTESTER;
        }
        const active = (0, util_1.isActiveValidator)(validator, currentEpoch);
        // We track effectiveBalanceByIncrement as ETH to fit total network balance in a JS number (53 bits)
        const effectiveBalanceByIncrement = Math.floor(validator.effectiveBalance / lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT);
        effectiveBalancesByIncrements[i] = effectiveBalanceByIncrement;
        if (active) {
            status.active = true;
            totalActiveStakeByIncrement += effectiveBalanceByIncrement;
        }
        // To optimize process_registry_updates():
        // ```python
        // def is_eligible_for_activation_queue(validator: Validator) -> bool:
        //   return (
        //     validator.activation_eligibility_epoch == FAR_FUTURE_EPOCH
        //     and validator.effective_balance == MAX_EFFECTIVE_BALANCE
        //   )
        // ```
        if (validator.activationEligibilityEpoch === lodestar_params_1.FAR_FUTURE_EPOCH &&
            validator.effectiveBalance === lodestar_params_1.MAX_EFFECTIVE_BALANCE) {
            indicesEligibleForActivationQueue.push(i);
        }
        // To optimize process_registry_updates():
        // ```python
        // def is_eligible_for_activation(state: BeaconState, validator: Validator) -> bool:
        //   return (
        //     validator.activation_eligibility_epoch <= state.finalized_checkpoint.epoch  # Placement in queue is finalized
        //     and validator.activation_epoch == FAR_FUTURE_EPOCH                          # Has not yet been activated
        //   )
        // ```
        // Here we have to check if `activationEligibilityEpoch <= currentEpoch` instead of finalized checkpoint, because the finalized
        // checkpoint may change during epoch processing at processJustificationAndFinalization(), which is called before processRegistryUpdates().
        // Then in processRegistryUpdates() we will check `activationEligibilityEpoch <= finalityEpoch`. This is to keep the array small.
        //
        // Use `else` since indicesEligibleForActivationQueue + indicesEligibleForActivation are mutually exclusive
        else if (validator.activationEpoch === lodestar_params_1.FAR_FUTURE_EPOCH && validator.activationEligibilityEpoch <= currentEpoch) {
            indicesEligibleForActivation.push(i);
        }
        // To optimize process_registry_updates():
        // ```python
        // if is_active_validator(validator, get_current_epoch(state)) and validator.effective_balance <= EJECTION_BALANCE:
        // ```
        // Adding extra condition `exitEpoch === FAR_FUTURE_EPOCH` to keep the array as small as possible. initiateValidatorExit() will ignore them anyway
        //
        // Use `else` since indicesEligibleForActivationQueue + indicesEligibleForActivation + indicesToEject are mutually exclusive
        else if (status.active &&
            validator.exitEpoch === lodestar_params_1.FAR_FUTURE_EPOCH &&
            validator.effectiveBalance <= config.EJECTION_BALANCE) {
            indicesToEject.push(i);
        }
        statuses.push(status);
        isActiveNextEpoch.push((0, util_1.isActiveValidator)(validator, nextEpoch));
        if ((0, util_1.isActiveValidator)(validator, nextShufflingEpoch)) {
            nextEpochShufflingActiveValidatorIndices.push(i);
        }
    }
    if (totalActiveStakeByIncrement < 1) {
        totalActiveStakeByIncrement = 1;
    }
    else if (totalActiveStakeByIncrement >= Number.MAX_SAFE_INTEGER) {
        throw Error("totalActiveStakeByIncrement >= Number.MAX_SAFE_INTEGER. MAX_EFFECTIVE_BALANCE is too low.");
    }
    // SPEC: function getBaseRewardPerIncrement()
    const baseRewardPerIncrement = (0, syncCommittee_1.computeBaseRewardPerIncrement)(totalActiveStakeByIncrement);
    // To optimize process_registry_updates():
    // order by sequence of activationEligibilityEpoch setting and then index
    indicesEligibleForActivation.sort((a, b) => validators[a].activationEligibilityEpoch - validators[b].activationEligibilityEpoch || a - b);
    if (forkName === lodestar_params_1.ForkName.phase0) {
        const statePhase0 = state;
        (0, processPendingAttestations_1.statusProcessEpoch)(statePhase0, statuses, statePhase0.previousEpochAttestations, prevEpoch, attesterStatus_1.FLAG_PREV_SOURCE_ATTESTER, attesterStatus_1.FLAG_PREV_TARGET_ATTESTER, attesterStatus_1.FLAG_PREV_HEAD_ATTESTER);
        (0, processPendingAttestations_1.statusProcessEpoch)(statePhase0, statuses, statePhase0.currentEpochAttestations, currentEpoch, attesterStatus_1.FLAG_CURR_SOURCE_ATTESTER, attesterStatus_1.FLAG_CURR_TARGET_ATTESTER, attesterStatus_1.FLAG_CURR_HEAD_ATTESTER);
    }
    else {
        state.previousEpochParticipation.forEachStatus((participationFlags, i) => {
            const status = statuses[i];
            // this is required to pass random spec tests in altair
            if (isActivePrevEpoch[i]) {
                status.flags |=
                    // FLAG_PREV are indexes [0,1,2]
                    status.flags |= participationFlags;
            }
        });
        state.currentEpochParticipation.forEachStatus((participationFlags, i) => {
            const status = statuses[i];
            // this is required to pass random spec tests in altair
            if (status.active) {
                status.flags |=
                    // FLAG_CURR are indexes [3,4,5], so shift by 3
                    status.flags |= participationFlags << 3;
            }
        });
    }
    let prevSourceUnslStake = 0;
    let prevTargetUnslStake = 0;
    let prevHeadUnslStake = 0;
    let currTargetUnslStake = 0;
    const FLAG_PREV_SOURCE_ATTESTER_UNSLASHED = attesterStatus_1.FLAG_PREV_SOURCE_ATTESTER | attesterStatus_1.FLAG_UNSLASHED;
    const FLAG_PREV_TARGET_ATTESTER_UNSLASHED = attesterStatus_1.FLAG_PREV_TARGET_ATTESTER | attesterStatus_1.FLAG_UNSLASHED;
    const FLAG_PREV_HEAD_ATTESTER_UNSLASHED = attesterStatus_1.FLAG_PREV_HEAD_ATTESTER | attesterStatus_1.FLAG_UNSLASHED;
    const FLAG_CURR_TARGET_UNSLASHED = attesterStatus_1.FLAG_CURR_TARGET_ATTESTER | attesterStatus_1.FLAG_UNSLASHED;
    for (let i = 0; i < statuses.length; i++) {
        const status = statuses[i];
        const effectiveBalanceByIncrement = effectiveBalancesByIncrements[i];
        if ((0, attesterStatus_1.hasMarkers)(status.flags, FLAG_PREV_SOURCE_ATTESTER_UNSLASHED)) {
            prevSourceUnslStake += effectiveBalanceByIncrement;
        }
        if ((0, attesterStatus_1.hasMarkers)(status.flags, FLAG_PREV_TARGET_ATTESTER_UNSLASHED)) {
            prevTargetUnslStake += effectiveBalanceByIncrement;
        }
        if ((0, attesterStatus_1.hasMarkers)(status.flags, FLAG_PREV_HEAD_ATTESTER_UNSLASHED)) {
            prevHeadUnslStake += effectiveBalanceByIncrement;
        }
        if ((0, attesterStatus_1.hasMarkers)(status.flags, FLAG_CURR_TARGET_UNSLASHED)) {
            currTargetUnslStake += effectiveBalanceByIncrement;
        }
    }
    // As per spec of `get_total_balance`:
    // EFFECTIVE_BALANCE_INCREMENT Gwei minimum to avoid divisions by zero.
    // Math safe up to ~10B ETH, afterwhich this overflows uint64.
    if (prevSourceUnslStake < 1)
        prevSourceUnslStake = 1;
    if (prevTargetUnslStake < 1)
        prevTargetUnslStake = 1;
    if (prevHeadUnslStake < 1)
        prevHeadUnslStake = 1;
    if (currTargetUnslStake < 1)
        currTargetUnslStake = 1;
    return {
        prevEpoch,
        currentEpoch,
        totalActiveStakeByIncrement,
        baseRewardPerIncrement,
        prevEpochUnslashedStake: {
            sourceStakeByIncrement: prevSourceUnslStake,
            targetStakeByIncrement: prevTargetUnslStake,
            headStakeByIncrement: prevHeadUnslStake,
        },
        currEpochUnslashedTargetStakeByIncrement: currTargetUnslStake,
        indicesToSlash,
        indicesEligibleForActivationQueue,
        indicesEligibleForActivation,
        indicesToEject,
        nextEpochShufflingActiveValidatorIndices,
        // to be updated in processEffectiveBalanceUpdates
        nextEpochTotalActiveBalanceByIncrement: 0,
        isActiveNextEpoch,
        statuses,
    };
}
exports.beforeProcessEpoch = beforeProcessEpoch;
//# sourceMappingURL=epochProcess.js.map