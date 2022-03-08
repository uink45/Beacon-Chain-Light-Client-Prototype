/**
 * @module chain/stateTransition/util
 */
import { Epoch, Bytes32, DomainType, allForks, ValidatorIndex } from "@chainsafe/lodestar-types";
import { EffectiveBalanceIncrements } from "../cache/effectiveBalanceIncrements";
import { IEpochShuffling } from "./epochShuffling";
/**
 * Compute proposer indices for an epoch
 */
export declare function computeProposers(state: allForks.BeaconState, shuffling: IEpochShuffling, effectiveBalanceIncrements: EffectiveBalanceIncrements): number[];
/**
 * Return from ``indices`` a random index sampled by effective balance.
 *
 * SLOW CODE - 🐢
 */
export declare function computeProposerIndex(effectiveBalanceIncrements: EffectiveBalanceIncrements, indices: ValidatorIndex[], seed: Uint8Array): ValidatorIndex;
/**
 * TODO: NAIVE
 *
 * Return the sync committee indices for a given state and epoch.
 * Aligns `epoch` to `baseEpoch` so the result is the same with any `epoch` within a sync period.
 *  Note: This function should only be called at sync committee period boundaries, as
 *  ``get_sync_committee_indices`` is not stable within a given period.
 *
 * SLOW CODE - 🐢
 */
export declare function getNextSyncCommitteeIndices(state: allForks.BeaconState, activeValidatorIndices: ValidatorIndex[], effectiveBalanceIncrements: EffectiveBalanceIncrements): ValidatorIndex[];
/**
 * Return the shuffled validator index corresponding to ``seed`` (and ``index_count``).
 *
 * Swap or not
 * https://link.springer.com/content/pdf/10.1007%2F978-3-642-32009-5_1.pdf
 *
 * See the 'generalized domain' algorithm on page 3.
 */
export declare function computeShuffledIndex(index: number, indexCount: number, seed: Bytes32): number;
/**
 * Return the randao mix at a recent [[epoch]].
 */
export declare function getRandaoMix(state: allForks.BeaconState, epoch: Epoch): Bytes32;
/**
 * Return the seed at [[epoch]].
 */
export declare function getSeed(state: allForks.BeaconState, epoch: Epoch, domainType: DomainType): Uint8Array;
//# sourceMappingURL=seed.d.ts.map