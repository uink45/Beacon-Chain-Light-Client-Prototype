import { EpochProcess, CachedBeaconStateAllForks } from "../../types";
/**
 * Persist blockRoots and stateRoots to historicalRoots.
 *
 * PERF: Very low (constant) cost. Most of the HistoricalBatch should already be hashed.
 */
export declare function processHistoricalRootsUpdate(state: CachedBeaconStateAllForks, epochProcess: EpochProcess): void;
//# sourceMappingURL=processHistoricalRootsUpdate.d.ts.map