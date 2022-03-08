"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSlot = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const constants_1 = require("../../constants");
/**
 * Dial state to next slot. Common for all forks
 */
function processSlot(state) {
    const { config } = state;
    const types = config.getForkTypes(state.slot);
    // Cache state root
    const previousStateRoot = types.BeaconState.hashTreeRoot(state);
    state.stateRoots[state.slot % lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT] = previousStateRoot;
    // Cache latest block header state root
    if (lodestar_types_1.ssz.Root.equals(state.latestBlockHeader.stateRoot, constants_1.ZERO_HASH)) {
        state.latestBlockHeader.stateRoot = previousStateRoot;
    }
    // Cache block root
    const previousBlockRoot = lodestar_types_1.ssz.phase0.BeaconBlockHeader.hashTreeRoot(state.latestBlockHeader);
    state.blockRoots[state.slot % lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT] = previousBlockRoot;
}
exports.processSlot = processSlot;
//# sourceMappingURL=index.js.map