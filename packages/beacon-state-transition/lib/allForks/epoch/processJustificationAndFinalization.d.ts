import { CachedBeaconStateAllForks, EpochProcess } from "../../types";
/**
 * Update justified and finalized checkpoints depending on network participation.
 *
 * PERF: Very low (constant) cost. Persist small objects to the tree.
 */
export declare function processJustificationAndFinalization(state: CachedBeaconStateAllForks, epochProcess: EpochProcess): void;
//# sourceMappingURL=processJustificationAndFinalization.d.ts.map