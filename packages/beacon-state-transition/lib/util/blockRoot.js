"use strict";
/**
 * @module chain/stateTransition/util
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockToHeader = exports.getTemporaryBlockHeader = exports.getBlockRoot = exports.getBlockRootAtSlot = void 0;
const constants_1 = require("../constants");
const epoch_1 = require("./epoch");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
/**
 * Return the block root at a recent [[slot]].
 */
function getBlockRootAtSlot(state, slot) {
    if (slot >= state.slot) {
        throw Error(`Can only get block root in the past currentSlot=${state.slot} slot=${slot}`);
    }
    if (slot < state.slot - lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT) {
        throw Error(`Cannot get block root more than ${lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT} in the past`);
    }
    return state.blockRoots[slot % lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT];
}
exports.getBlockRootAtSlot = getBlockRootAtSlot;
/**
 * Return the block root at the start of a recent [[epoch]].
 */
function getBlockRoot(state, epoch) {
    return getBlockRootAtSlot(state, (0, epoch_1.computeStartSlotAtEpoch)(epoch));
}
exports.getBlockRoot = getBlockRoot;
/**
 * Return the block header corresponding to a block with ``state_root`` set to ``ZERO_HASH``.
 */
function getTemporaryBlockHeader(config, block) {
    return {
        slot: block.slot,
        proposerIndex: block.proposerIndex,
        parentRoot: block.parentRoot,
        // `state_root` is zeroed and overwritten in the next `process_slot` call
        stateRoot: constants_1.ZERO_HASH,
        bodyRoot: config.getForkTypes(block.slot).BeaconBlockBody.hashTreeRoot(block.body),
    };
}
exports.getTemporaryBlockHeader = getTemporaryBlockHeader;
/**
 * Receives a BeaconBlock, and produces the corresponding BeaconBlockHeader.
 */
function blockToHeader(config, block) {
    return {
        stateRoot: block.stateRoot,
        proposerIndex: block.proposerIndex,
        slot: block.slot,
        parentRoot: block.parentRoot,
        bodyRoot: config.getForkTypes(block.slot).BeaconBlockBody.hashTreeRoot(block.body),
    };
}
exports.blockToHeader = blockToHeader;
//# sourceMappingURL=blockRoot.js.map