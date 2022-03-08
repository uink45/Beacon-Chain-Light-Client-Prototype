import { phase0 } from "@chainsafe/lodestar-types";
import { CachedBeaconStateAllForks } from "../../types";
/**
 * Initiate the exit of the validator with index ``index``.
 *
 * NOTE: This function takes a `validator` as argument instead of the validator index.
 * SSZ TreeBacked have a dangerous edge case that may break the code here in a non-obvious way.
 * When running `state.validators[i]` you get a SubTree of that validator with a hook to the state.
 * Then, when a property of `validator` is set it propagates the changes upwards to the parent tree up to the state.
 * This means that `validator` will propagate its new state along with the current state of its parent tree up to
 * the state, potentially overwriting changes done in other SubTrees before.
 * ```ts
 * // default state.validators, all zeroes
 * const validatorsA = state.validators
 * const validatorsB = state.validators
 * validatorsA[0].exitEpoch = 9
 * validatorsB[0].exitEpoch = 9 // Setting a value in validatorsB will overwrite all changes from validatorsA
 * // validatorsA[0].exitEpoch is 0
 * // validatorsB[0].exitEpoch is 9
 * ```
 * Forcing consumers to pass the SubTree of `validator` directly mitigates this issue.
 */
export declare function initiateValidatorExit(state: CachedBeaconStateAllForks, validator: phase0.Validator): void;
//# sourceMappingURL=initiateValidatorExit.d.ts.map