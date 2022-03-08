"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSlashingsReset = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
/**
 * Reset the next slashings balance accumulator
 *
 * PERF: Almost no (constant) cost
 */
function processSlashingsReset(state, epochProcess) {
    const nextEpoch = epochProcess.currentEpoch + 1;
    // reset slashings
    state.slashings[nextEpoch % lodestar_params_1.EPOCHS_PER_SLASHINGS_VECTOR] = BigInt(0);
}
exports.processSlashingsReset = processSlashingsReset;
//# sourceMappingURL=processSlashingsReset.js.map