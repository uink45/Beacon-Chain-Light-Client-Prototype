"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEffectiveBalanceUpdates = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
/**
 * Update effective balances if validator.balance has changed enough
 *
 * PERF: Cost 'proportional' to $VALIDATOR_COUNT, to iterate over all balances. Then cost is proportional to the amount
 * of validators whose effectiveBalance changed. Worst case is a massive network leak or a big slashing event which
 * causes a large amount of the network to decrease their balance simultaneously.
 *
 * - On normal mainnet conditions 0 validators change their effective balance
 * - In case of big innactivity event a medium portion of validators may have their effectiveBalance updated
 */
function processEffectiveBalanceUpdates(state, epochProcess) {
    const HYSTERESIS_INCREMENT = lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT / lodestar_params_1.HYSTERESIS_QUOTIENT;
    const DOWNWARD_THRESHOLD = HYSTERESIS_INCREMENT * lodestar_params_1.HYSTERESIS_DOWNWARD_MULTIPLIER;
    const UPWARD_THRESHOLD = HYSTERESIS_INCREMENT * lodestar_params_1.HYSTERESIS_UPWARD_MULTIPLIER;
    const { validators, epochCtx } = state;
    const { effectiveBalanceIncrements } = epochCtx;
    let nextEpochTotalActiveBalanceByIncrement = 0;
    // update effective balances with hysteresis
    if (!epochProcess.balances) {
        // only do this for genesis epoch, or spec test
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        epochProcess.balances = Array.from({ length: state.balanceList.length }, (_, i) => state.balanceList.get(i));
    }
    for (let i = 0, len = epochProcess.balances.length; i < len; i++) {
        const balance = epochProcess.balances[i];
        let effectiveBalanceIncrement = effectiveBalanceIncrements[i];
        let effectiveBalance = effectiveBalanceIncrement * lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT;
        if (
        // Too big
        effectiveBalance > balance + DOWNWARD_THRESHOLD ||
            // Too small. Check effectiveBalance < MAX_EFFECTIVE_BALANCE to prevent unnecessary updates
            (effectiveBalance < lodestar_params_1.MAX_EFFECTIVE_BALANCE && effectiveBalance < balance - UPWARD_THRESHOLD)) {
            effectiveBalance = Math.min(balance - (balance % lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT), lodestar_params_1.MAX_EFFECTIVE_BALANCE);
            // Update the state tree
            validators[i].effectiveBalance = effectiveBalance;
            // Also update the fast cached version
            // Should happen rarely, so it's fine to update the tree
            // TODO: Update all in batch after this loop
            effectiveBalanceIncrement = Math.floor(effectiveBalance / lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT);
            effectiveBalanceIncrements[i] = effectiveBalanceIncrement;
        }
        if (epochProcess.isActiveNextEpoch[i]) {
            // We track nextEpochTotalActiveBalanceByIncrement as ETH to fit total network balance in a JS number (53 bits)
            nextEpochTotalActiveBalanceByIncrement += effectiveBalanceIncrement;
        }
    }
    epochProcess.nextEpochTotalActiveBalanceByIncrement = nextEpochTotalActiveBalanceByIncrement;
}
exports.processEffectiveBalanceUpdates = processEffectiveBalanceUpdates;
//# sourceMappingURL=processEffectiveBalanceUpdates.js.map