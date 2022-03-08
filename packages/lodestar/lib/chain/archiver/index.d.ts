import { AbortSignal } from "@chainsafe/abort-controller";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IBeaconDb } from "../../db";
import { IBeaconChain } from "..";
/**
 * Used for running tasks that depends on some events or are executed
 * periodically.
 */
export declare class Archiver {
    private readonly db;
    private readonly chain;
    private readonly logger;
    private jobQueue;
    private readonly statesArchiver;
    constructor(db: IBeaconDb, chain: IBeaconChain, logger: ILogger, signal: AbortSignal);
    /** Archive latest finalized state */
    persistToDisk(): Promise<void>;
    private onFinalizedCheckpoint;
    private onCheckpoint;
    private processFinalizedCheckpoint;
    /**
     * Backfill sync relies on verified connected ranges (which are represented as key,value
     * with a verified jump from a key back to value). Since the node could have progressed
     * ahead from, we need to save the forward progress of this node as another backfill
     * range entry, that backfill sync will use to jump back if this node is restarted
     * for any reason.
     * The current backfill has its own backfill entry from anchor slot to last backfilled
     * slot. And this would create the entry from the current finalized slot to the anchor
     * slot.
     */
    private updateBackfillRange;
}
//# sourceMappingURL=index.d.ts.map