"use strict";
/**
 * @module chain/stateTransition/util
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEffectiveBalanceIncrementsZeroInactive = exports.decreaseBalance = exports.increaseBalance = exports.getTotalBalance = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
/**
 * Return the combined effective balance of the [[indices]].
 * `EFFECTIVE_BALANCE_INCREMENT` Gwei minimum to avoid divisions by zero.
 *
 * SLOW CODE - 🐢
 */
function getTotalBalance(state, indices) {
    return (0, lodestar_utils_1.bigIntMax)(BigInt(lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT), indices.reduce(
    // TODO: Use a fast cache to get the effective balance 🐢
    (total, index) => total + BigInt(state.validators[index].effectiveBalance), BigInt(0)));
}
exports.getTotalBalance = getTotalBalance;
/**
 * Increase the balance for a validator with the given ``index`` by ``delta``.
 */
function increaseBalance(state, index, delta) {
    // TODO: Inline this
    state.balanceList.applyDelta(index, delta);
}
exports.increaseBalance = increaseBalance;
/**
 * Decrease the balance for a validator with the given ``index`` by ``delta``.
 *
 * Set to ``0`` when underflow.
 */
function decreaseBalance(state, index, delta) {
    state.balanceList.applyDelta(index, -delta);
}
exports.decreaseBalance = decreaseBalance;
/**
 * This method is used to get justified balances from a justified state.
 * This is consumed by forkchoice which based on delta so we return "by increment" (in ether) value,
 * ie [30, 31, 32] instead of [30e9, 31e9, 32e9]
 */
function getEffectiveBalanceIncrementsZeroInactive(justifiedState) {
    const { activeIndices } = justifiedState.currentShuffling;
    // 5x faster than using readonlyValuesListOfLeafNodeStruct
    const validatorCount = justifiedState.validators.length;
    const { effectiveBalanceIncrements } = justifiedState;
    // Slice up to `validatorCount` since it won't be mutated, nor accessed beyond `validatorCount`
    const effectiveBalanceIncrementsZeroInactive = effectiveBalanceIncrements.slice(0, validatorCount);
    let j = 0;
    for (let i = 0; i < validatorCount; i++) {
        if (i === activeIndices[j]) {
            // active validator
            j++;
        }
        else {
            // inactive validator
            effectiveBalanceIncrementsZeroInactive[i] = 0;
        }
    }
    return effectiveBalanceIncrementsZeroInactive;
}
exports.getEffectiveBalanceIncrementsZeroInactive = getEffectiveBalanceIncrementsZeroInactive;
//# sourceMappingURL=balance.js.map