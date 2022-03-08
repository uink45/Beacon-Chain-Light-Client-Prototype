"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBaseRewardPerIncrement = exports.computeSyncParticipantReward = exports.getNextSyncCommittee = void 0;
const bls_1 = require("@chainsafe/bls");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const seed_1 = require("./seed");
/**
 * Return the sync committee for a given state and epoch.
 *
 * SLOW CODE - 🐢
 */
function getNextSyncCommittee(state, activeValidatorIndices, effectiveBalanceIncrements) {
    const indices = (0, seed_1.getNextSyncCommitteeIndices)(state, activeValidatorIndices, effectiveBalanceIncrements);
    // Using the index2pubkey cache is slower because it needs the serialized pubkey.
    const pubkeys = indices.map((index) => state.validators[index].pubkey);
    return {
        pubkeys,
        aggregatePubkey: (0, bls_1.aggregatePublicKeys)(pubkeys.map((pubkey) => pubkey.valueOf())),
    };
}
exports.getNextSyncCommittee = getNextSyncCommittee;
/**
 * Same logic in https://github.com/ethereum/eth2.0-specs/blob/v1.1.0-alpha.5/specs/altair/beacon-chain.md#sync-committee-processing
 */
function computeSyncParticipantReward(totalActiveBalanceIncrements) {
    const totalActiveBalance = BigInt(totalActiveBalanceIncrements) * BigInt(lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT);
    const baseRewardPerIncrement = Math.floor((lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT * lodestar_params_1.BASE_REWARD_FACTOR) / Number((0, lodestar_utils_1.bigIntSqrt)(totalActiveBalance)));
    const totalBaseRewards = baseRewardPerIncrement * totalActiveBalanceIncrements;
    const maxParticipantRewards = Math.floor(Math.floor((totalBaseRewards * lodestar_params_1.SYNC_REWARD_WEIGHT) / lodestar_params_1.WEIGHT_DENOMINATOR) / lodestar_params_1.SLOTS_PER_EPOCH);
    return Math.floor(maxParticipantRewards / lodestar_params_1.SYNC_COMMITTEE_SIZE);
}
exports.computeSyncParticipantReward = computeSyncParticipantReward;
/**
 * Before we manage bigIntSqrt(totalActiveStake) as BigInt and return BigInt.
 * bigIntSqrt(totalActiveStake) should fit a number (2 ** 53 -1 max)
 **/
function computeBaseRewardPerIncrement(totalActiveStakeByIncrement) {
    return Math.floor((lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT * lodestar_params_1.BASE_REWARD_FACTOR) /
        Number((0, lodestar_utils_1.bigIntSqrt)(BigInt(totalActiveStakeByIncrement) * BigInt(lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT))));
}
exports.computeBaseRewardPerIncrement = computeBaseRewardPerIncrement;
//# sourceMappingURL=syncCommittee.js.map