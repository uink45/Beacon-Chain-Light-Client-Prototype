"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processHistoricalRootsUpdate = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
/**
 * Persist blockRoots and stateRoots to historicalRoots.
 *
 * PERF: Very low (constant) cost. Most of the HistoricalBatch should already be hashed.
 */
function processHistoricalRootsUpdate(state, epochProcess) {
    const nextEpoch = epochProcess.currentEpoch + 1;
    // set historical root accumulator
    if (nextEpoch % (0, lodestar_utils_1.intDiv)(lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT, lodestar_params_1.SLOTS_PER_EPOCH) === 0) {
        state.historicalRoots.push(lodestar_types_1.ssz.phase0.HistoricalBatch.hashTreeRoot({
            blockRoots: state.blockRoots,
            stateRoots: state.stateRoots,
        }));
    }
}
exports.processHistoricalRootsUpdate = processHistoricalRootsUpdate;
//# sourceMappingURL=processHistoricalRootsUpdate.js.map