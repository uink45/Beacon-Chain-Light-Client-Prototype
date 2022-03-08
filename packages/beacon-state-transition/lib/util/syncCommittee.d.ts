import { allForks, altair, ValidatorIndex } from "@chainsafe/lodestar-types";
import { EffectiveBalanceIncrements } from "../cache/effectiveBalanceIncrements";
/**
 * Return the sync committee for a given state and epoch.
 *
 * SLOW CODE - 🐢
 */
export declare function getNextSyncCommittee(state: allForks.BeaconState, activeValidatorIndices: ValidatorIndex[], effectiveBalanceIncrements: EffectiveBalanceIncrements): altair.SyncCommittee;
/**
 * Same logic in https://github.com/ethereum/eth2.0-specs/blob/v1.1.0-alpha.5/specs/altair/beacon-chain.md#sync-committee-processing
 */
export declare function computeSyncParticipantReward(totalActiveBalanceIncrements: number): number;
/**
 * Before we manage bigIntSqrt(totalActiveStake) as BigInt and return BigInt.
 * bigIntSqrt(totalActiveStake) should fit a number (2 ** 53 -1 max)
 **/
export declare function computeBaseRewardPerIncrement(totalActiveStakeByIncrement: number): number;
//# sourceMappingURL=syncCommittee.d.ts.map