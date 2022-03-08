"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEth1DataReset = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
/**
 * Reset eth1DataVotes tree every `EPOCHS_PER_ETH1_VOTING_PERIOD`.
 *
 * PERF: Almost no (constant) cost
 */
function processEth1DataReset(state, epochProcess) {
    const nextEpoch = epochProcess.currentEpoch + 1;
    // reset eth1 data votes
    if (nextEpoch % lodestar_params_1.EPOCHS_PER_ETH1_VOTING_PERIOD === 0) {
        state.eth1DataVotes = [];
    }
}
exports.processEth1DataReset = processEth1DataReset;
//# sourceMappingURL=processEth1DataReset.js.map