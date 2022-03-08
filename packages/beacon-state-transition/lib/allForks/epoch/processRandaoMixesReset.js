"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRandaoMixesReset = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const util_1 = require("../../util");
/**
 * Write next randaoMix
 *
 * PERF: Almost no (constant) cost
 */
function processRandaoMixesReset(state, epochProcess) {
    const currentEpoch = epochProcess.currentEpoch;
    const nextEpoch = currentEpoch + 1;
    // set randao mix
    state.randaoMixes[nextEpoch % lodestar_params_1.EPOCHS_PER_HISTORICAL_VECTOR] = (0, util_1.getRandaoMix)(state, currentEpoch);
}
exports.processRandaoMixesReset = processRandaoMixesReset;
//# sourceMappingURL=processRandaoMixesReset.js.map