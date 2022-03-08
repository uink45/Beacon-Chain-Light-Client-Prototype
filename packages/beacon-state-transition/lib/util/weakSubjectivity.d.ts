import { IBeaconConfig, IChainForkConfig } from "@chainsafe/lodestar-config";
import { allForks, Epoch, Root } from "@chainsafe/lodestar-types";
import { Checkpoint } from "@chainsafe/lodestar-types/phase0";
import { CachedBeaconStateAllForks } from "../types";
export declare const ETH_TO_GWEI: number;
/**
 * Returns the epoch of the latest weak subjectivity checkpoint for the given
  `state` and `safetyDecay`. The default `safetyDecay` used should be 10% (= 0.1)
 */
export declare function getLatestWeakSubjectivityCheckpointEpoch(config: IChainForkConfig, state: CachedBeaconStateAllForks): Epoch;
/**
  Returns the weak subjectivity period for the current `state`.
    This computation takes into account the effect of:
      - validator set churn (bounded by `get_validator_churn_limit()` per epoch), and
      - validator balance top-ups (bounded by `MAX_DEPOSITS * SLOTS_PER_EPOCH` per epoch).
    A detailed calculation can be found at:
    https://github.com/runtimeverification/beacon-chain-verification/blob/master/weak-subjectivity/weak-subjectivity-analysis.pdf
 */
export declare function computeWeakSubjectivityPeriodCachedState(config: IChainForkConfig, state: CachedBeaconStateAllForks): number;
/**
 * Same to computeWeakSubjectivityPeriodCachedState but for normal state
 * This is called only 1 time at app startup so it's ok to calculate totalActiveBalanceIncrements manually
 */
export declare function computeWeakSubjectivityPeriod(config: IChainForkConfig, state: allForks.BeaconState): number;
export declare function computeWeakSubjectivityPeriodFromConstituents(activeValidatorCount: number, totalBalanceByIncrement: number, churnLimit: number, minWithdrawabilityDelay: number): number;
export declare function getLatestBlockRoot(config: IChainForkConfig, state: allForks.BeaconState): Root;
export declare function isWithinWeakSubjectivityPeriod(config: IBeaconConfig, wsState: allForks.BeaconState, wsCheckpoint: Checkpoint): boolean;
//# sourceMappingURL=weakSubjectivity.d.ts.map