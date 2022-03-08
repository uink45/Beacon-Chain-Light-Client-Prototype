import { allForks, bellatrix } from "@chainsafe/lodestar-types";
/**
 * Execution enabled = merge is done.
 * When (A) state has execution data OR (B) block has execution data
 */
export declare function isExecutionEnabled(state: bellatrix.BeaconState, body: bellatrix.BeaconBlockBody): boolean;
/**
 * Merge block is the SINGLE block that transitions from POW to POS.
 * state has no execution data AND this block has execution data
 */
export declare function isMergeTransitionBlock(state: bellatrix.BeaconState, body: bellatrix.BeaconBlockBody): boolean;
/**
 * Merge is complete when the state includes execution layer data:
 * state.latestExecutionPayloadHeader NOT EMPTY
 */
export declare function isMergeTransitionComplete(state: bellatrix.BeaconState): boolean;
/** Type guard for bellatrix.BeaconState */
export declare function isBellatrixStateType(state: allForks.BeaconState): state is bellatrix.BeaconState;
/** Type guard for bellatrix.BeaconBlockBody */
export declare function isBellatrixBlockBodyType(blockBody: allForks.BeaconBlockBody): blockBody is bellatrix.BeaconBlockBody;
//# sourceMappingURL=utils.d.ts.map