import { ByteVector } from "@chainsafe/ssz";
import { Epoch, RootHex } from "@chainsafe/lodestar-types";
import { CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { routes } from "@chainsafe/lodestar-api";
import { IMetrics } from "../../metrics";
/**
 * In memory cache of CachedBeaconState
 *
 * Similar API to Repository
 */
export declare class StateContextCache {
    /**
     * Max number of states allowed in the cache
     */
    readonly maxStates: number;
    private readonly cache;
    /** Epoch -> Set<blockRoot> */
    private readonly epochIndex;
    private readonly metrics;
    constructor({ maxStates, metrics }: {
        maxStates?: number;
        metrics?: IMetrics | null;
    });
    get(rootHex: RootHex): CachedBeaconStateAllForks | null;
    add(item: CachedBeaconStateAllForks): void;
    delete(root: ByteVector): void;
    batchDelete(roots: ByteVector[]): void;
    clear(): void;
    get size(): number;
    /**
     * TODO make this more robust.
     * Without more thought, this currently breaks our assumptions about recent state availablity
     */
    prune(headStateRootHex: RootHex): void;
    /**
     * Prune per finalized epoch.
     */
    deleteAllBeforeEpoch(finalizedEpoch: Epoch): void;
    /** ONLY FOR DEBUGGING PURPOSES. For lodestar debug API */
    dumpSummary(): routes.lodestar.StateCacheItem[];
    private deleteAllEpochItems;
}
//# sourceMappingURL=stateContextCache.d.ts.map