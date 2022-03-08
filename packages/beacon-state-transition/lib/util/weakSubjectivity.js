"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWithinWeakSubjectivityPeriod = exports.getLatestBlockRoot = exports.computeWeakSubjectivityPeriodFromConstituents = exports.computeWeakSubjectivityPeriod = exports.computeWeakSubjectivityPeriodCachedState = exports.getLatestWeakSubjectivityCheckpointEpoch = exports.ETH_TO_GWEI = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
const __1 = require("..");
exports.ETH_TO_GWEI = 10 ** 9;
const SAFETY_DECAY = BigInt(10);
/**
 * Returns the epoch of the latest weak subjectivity checkpoint for the given
  `state` and `safetyDecay`. The default `safetyDecay` used should be 10% (= 0.1)
 */
function getLatestWeakSubjectivityCheckpointEpoch(config, state) {
    return state.epochCtx.currentShuffling.epoch - computeWeakSubjectivityPeriodCachedState(config, state);
}
exports.getLatestWeakSubjectivityCheckpointEpoch = getLatestWeakSubjectivityCheckpointEpoch;
/**
  Returns the weak subjectivity period for the current `state`.
    This computation takes into account the effect of:
      - validator set churn (bounded by `get_validator_churn_limit()` per epoch), and
      - validator balance top-ups (bounded by `MAX_DEPOSITS * SLOTS_PER_EPOCH` per epoch).
    A detailed calculation can be found at:
    https://github.com/runtimeverification/beacon-chain-verification/blob/master/weak-subjectivity/weak-subjectivity-analysis.pdf
 */
function computeWeakSubjectivityPeriodCachedState(config, state) {
    const activeValidatorCount = state.currentShuffling.activeIndices.length;
    return computeWeakSubjectivityPeriodFromConstituents(activeValidatorCount, state.totalActiveBalanceIncrements, (0, __1.getChurnLimit)(config, activeValidatorCount), config.MIN_VALIDATOR_WITHDRAWABILITY_DELAY);
}
exports.computeWeakSubjectivityPeriodCachedState = computeWeakSubjectivityPeriodCachedState;
/**
 * Same to computeWeakSubjectivityPeriodCachedState but for normal state
 * This is called only 1 time at app startup so it's ok to calculate totalActiveBalanceIncrements manually
 */
function computeWeakSubjectivityPeriod(config, state) {
    const activeIndices = (0, __1.getActiveValidatorIndices)(state, (0, __1.getCurrentEpoch)(state));
    let totalActiveBalanceIncrements = 0;
    for (const index of activeIndices) {
        totalActiveBalanceIncrements += Math.floor(state.validators[index].effectiveBalance / lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT);
    }
    if (totalActiveBalanceIncrements <= 1) {
        totalActiveBalanceIncrements = 1;
    }
    return computeWeakSubjectivityPeriodFromConstituents(activeIndices.length, totalActiveBalanceIncrements, (0, __1.getChurnLimit)(config, activeIndices.length), config.MIN_VALIDATOR_WITHDRAWABILITY_DELAY);
}
exports.computeWeakSubjectivityPeriod = computeWeakSubjectivityPeriod;
function computeWeakSubjectivityPeriodFromConstituents(activeValidatorCount, totalBalanceByIncrement, churnLimit, minWithdrawabilityDelay) {
    const N = activeValidatorCount;
    // originally const t = Number(totalBalance / BigInt(N) / BigInt(ETH_TO_GWEI));
    // totalBalanceByIncrement = totalBalance / MAX_EFFECTIVE_BALANCE and MAX_EFFECTIVE_BALANCE = ETH_TO_GWEI atm
    // we need to change this calculation just in case MAX_EFFECTIVE_BALANCE != ETH_TO_GWEI
    const t = Math.floor(totalBalanceByIncrement / N);
    const T = Number(lodestar_params_1.MAX_EFFECTIVE_BALANCE / exports.ETH_TO_GWEI);
    const delta = churnLimit;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Delta = lodestar_params_1.MAX_DEPOSITS * lodestar_params_1.SLOTS_PER_EPOCH;
    const D = Number(SAFETY_DECAY);
    let wsPeriod = minWithdrawabilityDelay;
    if (T * (200 + 3 * D) < t * (200 + 12 * D)) {
        const epochsForValidatorSetChurn = Math.floor((N * (t * (200 + 12 * D) - T * (200 + 3 * D))) / (600 * delta * (2 * t + T)));
        const epochsForBalanceTopUps = Math.floor((N * (200 + 3 * D)) / (600 * Delta));
        wsPeriod +=
            epochsForValidatorSetChurn > epochsForBalanceTopUps ? epochsForValidatorSetChurn : epochsForBalanceTopUps;
    }
    else {
        wsPeriod += Math.floor((3 * N * D * t) / (200 * Delta * (T - t)));
    }
    return wsPeriod;
}
exports.computeWeakSubjectivityPeriodFromConstituents = computeWeakSubjectivityPeriodFromConstituents;
function getLatestBlockRoot(config, state) {
    const header = lodestar_types_1.ssz.phase0.BeaconBlockHeader.clone(state.latestBlockHeader);
    if (lodestar_types_1.ssz.Root.equals(header.stateRoot, __1.ZERO_HASH)) {
        header.stateRoot = config.getForkTypes(state.slot).BeaconState.hashTreeRoot(state);
    }
    return lodestar_types_1.ssz.phase0.BeaconBlockHeader.hashTreeRoot(header);
}
exports.getLatestBlockRoot = getLatestBlockRoot;
function isWithinWeakSubjectivityPeriod(config, wsState, wsCheckpoint) {
    const wsStateEpoch = (0, __1.computeEpochAtSlot)(wsState.slot);
    const blockRoot = getLatestBlockRoot(config, wsState);
    if (!lodestar_types_1.ssz.Root.equals(blockRoot, wsCheckpoint.root)) {
        throw new Error(`Roots do not match.  expected=${(0, ssz_1.toHexString)(wsCheckpoint.root)}, actual=${(0, ssz_1.toHexString)(blockRoot)}`);
    }
    if (!lodestar_types_1.ssz.Epoch.equals(wsStateEpoch, wsCheckpoint.epoch)) {
        throw new Error(`Epochs do not match.  expected=${wsCheckpoint.epoch}, actual=${wsStateEpoch}`);
    }
    const wsPeriod = computeWeakSubjectivityPeriod(config, wsState);
    const clockEpoch = (0, __1.computeEpochAtSlot)((0, __1.getCurrentSlot)(config, wsState.genesisTime));
    return clockEpoch <= wsStateEpoch + wsPeriod;
}
exports.isWithinWeakSubjectivityPeriod = isWithinWeakSubjectivityPeriod;
//# sourceMappingURL=weakSubjectivity.js.map