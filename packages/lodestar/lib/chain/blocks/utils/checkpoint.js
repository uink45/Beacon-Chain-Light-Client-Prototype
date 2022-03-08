"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCheckpointFromState = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const constants_1 = require("../../../constants");
/**
 * Compute a Checkpoint type from `state.latestBlockHeader`
 */
function getCheckpointFromState(checkpointState) {
    const config = checkpointState.config;
    const slot = checkpointState.slot;
    if (slot % lodestar_params_1.SLOTS_PER_EPOCH !== 0) {
        throw Error("Checkpoint state slot must be first in an epoch");
    }
    const blockHeader = lodestar_types_1.ssz.phase0.BeaconBlockHeader.clone(checkpointState.latestBlockHeader);
    if (lodestar_types_1.ssz.Root.equals(blockHeader.stateRoot, constants_1.ZERO_HASH)) {
        blockHeader.stateRoot = config.getForkTypes(slot).BeaconState.hashTreeRoot(checkpointState);
    }
    return {
        root: lodestar_types_1.ssz.phase0.BeaconBlockHeader.hashTreeRoot(blockHeader),
        epoch: (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot),
    };
}
exports.getCheckpointFromState = getCheckpointFromState;
//# sourceMappingURL=checkpoint.js.map