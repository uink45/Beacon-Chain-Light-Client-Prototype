"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRewardsAndPenaltiesAllForks = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const getAttestationDeltas_1 = require("../../phase0/epoch/getAttestationDeltas");
const getRewardsAndPenalties_1 = require("../../altair/epoch/getRewardsAndPenalties");
/**
 * Iterate over all validator and compute rewards and penalties to apply to balances.
 *
 * PERF: Cost = 'proportional' to $VALIDATOR_COUNT. Extra work is done per validator the more status flags
 * are true, worst case: FLAG_UNSLASHED + FLAG_ELIGIBLE_ATTESTER + FLAG_PREV_*
 */
function processRewardsAndPenaltiesAllForks(fork, state, epochProcess) {
    // No rewards are applied at the end of `GENESIS_EPOCH` because rewards are for work done in the previous epoch
    if (epochProcess.currentEpoch === lodestar_params_1.GENESIS_EPOCH) {
        return;
    }
    const [rewards, penalties] = fork === lodestar_params_1.ForkName.phase0
        ? (0, getAttestationDeltas_1.getAttestationDeltas)(state, epochProcess)
        : (0, getRewardsAndPenalties_1.getRewardsAndPenalties)(state, epochProcess);
    const deltas = [];
    for (let i = 0, len = rewards.length; i < len; i++) {
        deltas.push(rewards[i] - penalties[i]);
    }
    // important: do not change state one balance at a time
    // set them all at once, constructing the tree in one go
    // cache the balances array, too
    epochProcess.balances = state.balanceList.updateAll(deltas);
}
exports.processRewardsAndPenaltiesAllForks = processRewardsAndPenaltiesAllForks;
//# sourceMappingURL=processRewardsAndPenalties.js.map