"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBellatrixBlockBodyType = exports.isBellatrixStateType = exports.isMergeTransitionComplete = exports.isMergeTransitionBlock = exports.isExecutionEnabled = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
/**
 * Execution enabled = merge is done.
 * When (A) state has execution data OR (B) block has execution data
 */
function isExecutionEnabled(state, body) {
    return (isMergeTransitionComplete(state) ||
        !lodestar_types_1.ssz.bellatrix.ExecutionPayload.equals(body.executionPayload, lodestar_types_1.ssz.bellatrix.ExecutionPayload.defaultValue()));
}
exports.isExecutionEnabled = isExecutionEnabled;
/**
 * Merge block is the SINGLE block that transitions from POW to POS.
 * state has no execution data AND this block has execution data
 */
function isMergeTransitionBlock(state, body) {
    return (!isMergeTransitionComplete(state) &&
        !lodestar_types_1.ssz.bellatrix.ExecutionPayload.equals(body.executionPayload, lodestar_types_1.ssz.bellatrix.ExecutionPayload.defaultValue()));
}
exports.isMergeTransitionBlock = isMergeTransitionBlock;
/**
 * Merge is complete when the state includes execution layer data:
 * state.latestExecutionPayloadHeader NOT EMPTY
 */
function isMergeTransitionComplete(state) {
    return !lodestar_types_1.ssz.bellatrix.ExecutionPayloadHeader.equals(state.latestExecutionPayloadHeader, lodestar_types_1.ssz.bellatrix.ExecutionPayloadHeader.defaultTreeBacked());
}
exports.isMergeTransitionComplete = isMergeTransitionComplete;
/** Type guard for bellatrix.BeaconState */
function isBellatrixStateType(state) {
    return state.latestExecutionPayloadHeader !== undefined;
}
exports.isBellatrixStateType = isBellatrixStateType;
/** Type guard for bellatrix.BeaconBlockBody */
function isBellatrixBlockBodyType(blockBody) {
    return blockBody.executionPayload !== undefined;
}
exports.isBellatrixBlockBodyType = isBellatrixBlockBodyType;
//# sourceMappingURL=utils.js.map