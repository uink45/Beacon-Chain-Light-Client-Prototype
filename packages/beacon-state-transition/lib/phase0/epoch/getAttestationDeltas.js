"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttestationDeltas = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const constants_1 = require("../../constants");
const util_1 = require("../../util");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const attesterStatus_1 = require("../../util/attesterStatus");
/**
 * Redefine constants in attesterStatus to improve performance
 */
const FLAG_PREV_SOURCE_ATTESTER = 1 << 0;
const FLAG_PREV_TARGET_ATTESTER = 1 << 1;
const FLAG_PREV_HEAD_ATTESTER = 1 << 2;
const FLAG_UNSLASHED = 1 << 6;
const FLAG_ELIGIBLE_ATTESTER = 1 << 7;
const FLAG_PREV_SOURCE_ATTESTER_OR_UNSLASHED = FLAG_PREV_SOURCE_ATTESTER | FLAG_UNSLASHED;
const FLAG_PREV_TARGET_ATTESTER_OR_UNSLASHED = FLAG_PREV_TARGET_ATTESTER | FLAG_UNSLASHED;
const FLAG_PREV_HEAD_ATTESTER_OR_UNSLASHED = FLAG_PREV_HEAD_ATTESTER | FLAG_UNSLASHED;
/**
 * Return attestation reward/penalty deltas for each validator.
 *
 * - On normal mainnet conditions
 *   - prevSourceAttester: 98%
 *   - prevTargetAttester: 96%
 *   - prevHeadAttester:   93%
 *   - currSourceAttester: 95%
 *   - currTargetAttester: 93%
 *   - currHeadAttester:   91%
 *   - unslashed:          100%
 *   - eligibleAttester:   98%
 */
function getAttestationDeltas(state, epochProcess) {
    const validatorCount = epochProcess.statuses.length;
    const rewards = (0, util_1.newZeroedArray)(validatorCount);
    const penalties = (0, util_1.newZeroedArray)(validatorCount);
    // no need this as we make sure it in EpochProcess
    // let totalBalance = bigIntMax(epochProcess.totalActiveStake, increment);
    const totalBalance = epochProcess.totalActiveStakeByIncrement;
    const totalBalanceInGwei = BigInt(totalBalance) * BigInt(lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT);
    // increment is factored out from balance totals to avoid overflow
    const prevEpochSourceStakeByIncrement = epochProcess.prevEpochUnslashedStake.sourceStakeByIncrement;
    const prevEpochTargetStakeByIncrement = epochProcess.prevEpochUnslashedStake.targetStakeByIncrement;
    const prevEpochHeadStakeByIncrement = epochProcess.prevEpochUnslashedStake.headStakeByIncrement;
    // sqrt first, before factoring out the increment for later usage
    const balanceSqRoot = Number((0, lodestar_utils_1.bigIntSqrt)(totalBalanceInGwei));
    const finalityDelay = epochProcess.prevEpoch - state.finalizedCheckpoint.epoch;
    const BASE_REWARDS_PER_EPOCH = constants_1.BASE_REWARDS_PER_EPOCH;
    const proposerRewardQuotient = Number(lodestar_params_1.PROPOSER_REWARD_QUOTIENT);
    const isInInactivityLeak = finalityDelay > lodestar_params_1.MIN_EPOCHS_TO_INACTIVITY_PENALTY;
    // effectiveBalance is multiple of EFFECTIVE_BALANCE_INCREMENT and less than MAX_EFFECTIVE_BALANCE
    // so there are limited values of them like 32, 31, 30
    const rewardPnaltyItemCache = new Map();
    const { statuses } = epochProcess;
    const { effectiveBalanceIncrements } = state.epochCtx;
    for (let i = 0; i < statuses.length; i++) {
        const effectiveBalanceIncrement = effectiveBalanceIncrements[i];
        const effectiveBalance = effectiveBalanceIncrement * lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT;
        const status = statuses[i];
        let rewardItem = rewardPnaltyItemCache.get(effectiveBalanceIncrement);
        if (!rewardItem) {
            const baseReward = Math.floor(Math.floor((effectiveBalance * lodestar_params_1.BASE_REWARD_FACTOR) / balanceSqRoot) / BASE_REWARDS_PER_EPOCH);
            const proposerReward = Math.floor(baseReward / proposerRewardQuotient);
            rewardItem = {
                baseReward,
                proposerReward,
                maxAttesterReward: baseReward - proposerReward,
                sourceCheckpointReward: isInInactivityLeak
                    ? baseReward
                    : Math.floor((baseReward * prevEpochSourceStakeByIncrement) / totalBalance),
                targetCheckpointReward: isInInactivityLeak
                    ? baseReward
                    : Math.floor((baseReward * prevEpochTargetStakeByIncrement) / totalBalance),
                headReward: isInInactivityLeak
                    ? baseReward
                    : Math.floor((baseReward * prevEpochHeadStakeByIncrement) / totalBalance),
                basePenalty: baseReward * constants_1.BASE_REWARDS_PER_EPOCH - proposerReward,
                finalityDelayPenalty: Math.floor((effectiveBalance * finalityDelay) / lodestar_params_1.INACTIVITY_PENALTY_QUOTIENT),
            };
            rewardPnaltyItemCache.set(effectiveBalanceIncrement, rewardItem);
        }
        const { baseReward, proposerReward, maxAttesterReward, sourceCheckpointReward, targetCheckpointReward, headReward, basePenalty, finalityDelayPenalty, } = rewardItem;
        // inclusion speed bonus
        if ((0, attesterStatus_1.hasMarkers)(status.flags, FLAG_PREV_SOURCE_ATTESTER_OR_UNSLASHED)) {
            rewards[status.proposerIndex] += proposerReward;
            rewards[i] += Math.floor(maxAttesterReward / status.inclusionDelay);
        }
        if ((0, attesterStatus_1.hasMarkers)(status.flags, FLAG_ELIGIBLE_ATTESTER)) {
            // expected FFG source
            if ((0, attesterStatus_1.hasMarkers)(status.flags, FLAG_PREV_SOURCE_ATTESTER_OR_UNSLASHED)) {
                // justification-participation reward
                rewards[i] += sourceCheckpointReward;
            }
            else {
                // justification-non-participation R-penalty
                penalties[i] += baseReward;
            }
            // expected FFG target
            if ((0, attesterStatus_1.hasMarkers)(status.flags, FLAG_PREV_TARGET_ATTESTER_OR_UNSLASHED)) {
                // boundary-attestation reward
                rewards[i] += targetCheckpointReward;
            }
            else {
                // boundary-attestation-non-participation R-penalty
                penalties[i] += baseReward;
            }
            // expected head
            if ((0, attesterStatus_1.hasMarkers)(status.flags, FLAG_PREV_HEAD_ATTESTER_OR_UNSLASHED)) {
                // canonical-participation reward
                rewards[i] += headReward;
            }
            else {
                // non-canonical-participation R-penalty
                penalties[i] += baseReward;
            }
            // take away max rewards if we're not finalizing
            if (isInInactivityLeak) {
                penalties[i] += basePenalty;
                if (!(0, attesterStatus_1.hasMarkers)(status.flags, FLAG_PREV_TARGET_ATTESTER_OR_UNSLASHED)) {
                    penalties[i] += finalityDelayPenalty;
                }
            }
        }
    }
    return [rewards, penalties];
}
exports.getAttestationDeltas = getAttestationDeltas;
//# sourceMappingURL=getAttestationDeltas.js.map