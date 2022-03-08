"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRewardsAndPenalties = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const processRewardsAndPenalties_1 = require("../../allForks/epoch/processRewardsAndPenalties");
/**
 * Iterate over all validator and compute rewards and penalties to apply to balances.
 *
 * PERF: Cost = 'proportional' to $VALIDATOR_COUNT. Extra work is done per validator the more status flags
 * are true, worst case: FLAG_UNSLASHED + FLAG_ELIGIBLE_ATTESTER + FLAG_PREV_*
 */
function processRewardsAndPenalties(state, epochProcess) {
    (0, processRewardsAndPenalties_1.processRewardsAndPenaltiesAllForks)(lodestar_params_1.ForkName.altair, state, epochProcess);
}
exports.processRewardsAndPenalties = processRewardsAndPenalties;
//# sourceMappingURL=processRewardsAndPenalties.js.map