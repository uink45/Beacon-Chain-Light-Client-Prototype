/**
 * @module chain/stateTransition/util
 */
import { Epoch, phase0, ValidatorIndex, allForks } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
/**
 * Check if [[validator]] is active
 */
export declare function isActiveValidator(validator: phase0.Validator, epoch: Epoch): boolean;
/**
 * Check if [[validator]] is slashable
 */
export declare function isSlashableValidator(validator: phase0.Validator, epoch: Epoch): boolean;
/**
 * Return the sequence of active validator indices at [[epoch]].
 *
 * NAIVE - SLOW CODE 🐢
 */
export declare function getActiveValidatorIndices(state: allForks.BeaconState, epoch: Epoch): ValidatorIndex[];
export declare function getChurnLimit(config: IChainForkConfig, activeValidatorCount: number): number;
//# sourceMappingURL=validator.d.ts.map