import { phase0, Epoch, RootHex } from "@chainsafe/lodestar-types";
import { CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { routes } from "@chainsafe/lodestar-api";
import { IMetrics } from "../../metrics";
declare type CheckpointHex = {
    epoch: Epoch;
    rootHex: RootHex;
};
/**
 * In memory cache of CachedBeaconState
 * belonging to checkpoint
 *
 * Similar API to Repository
 */
export declare class CheckpointStateCache {
    private readonly cache;
    /** Epoch -> Set<blockRoot> */
    private readonly epochIndex;
    private readonly metrics;
    private preComputedCheckpoint;
    private preComputedCheckpointHits;
    constructor({ metrics }: {
        metrics?: IMetrics | null;
    });
    get(cp: CheckpointHex): CachedBeaconStateAllForks | null;
    add(cp: phase0.Checkpoint, item: CachedBeaconStateAllForks): void;
    /**
     * Searches for the latest cached state with a `root`, starting with `epoch` and descending
     */
    getLatest(rootHex: RootHex, maxEpoch: Epoch): CachedBeaconStateAllForks | null;
    /**
     * Update the precomputed checkpoint and return the number of his for the
     * previous one (if any).
     */
    updatePreComputedCheckpoint(rootHex: RootHex, epoch: Epoch): number | null;
    pruneFinalized(finalizedEpoch: Epoch): void;
    prune(finalizedEpoch: Epoch, justifiedEpoch: Epoch): void;
    delete(cp: phase0.Checkpoint): void;
    deleteAllEpochItems(epoch: Epoch): void;
    clear(): void;
    /** ONLY FOR DEBUGGING PURPOSES. For lodestar debug API */
    dumpSummary(): routes.lodestar.StateCacheItem[];
    /** ONLY FOR DEBUGGING PURPOSES. For spec tests on error */
    dumpCheckpointKeys(): string[];
}
export declare function toCheckpointHex(checkpoint: phase0.Checkpoint): CheckpointHex;
export declare function toCheckpointKey(cp: CheckpointHex): string;
export {};
//# sourceMappingURL=stateContextCheckpointsCache.d.ts.map