/**
 * @module tasks
 */
import { ILogger } from "@chainsafe/lodestar-utils";
import { IBeaconDb } from "../../db";
import { CheckpointStateCache } from "../stateCache";
import { CheckpointWithHex } from "@chainsafe/lodestar-fork-choice";
/**
 * Minimum number of epochs between archived states
 */
export declare const PERSIST_STATE_EVERY_EPOCHS = 1024;
/**
 * Archives finalized states from active bucket to archive bucket.
 *
 * Only the new finalized state is stored to disk
 */
export declare class StatesArchiver {
    private readonly checkpointStateCache;
    private readonly db;
    private readonly logger;
    constructor(checkpointStateCache: CheckpointStateCache, db: IBeaconDb, logger: ILogger);
    /**
     * Persist states every some epochs to
     * - Minimize disk space, storing the least states possible
     * - Minimize the sync progress lost on unexpected crash, storing temp state every few epochs
     *
     * At epoch `e` there will be states peristed at intervals of `PERSIST_STATE_EVERY_EPOCHS` = 32
     * and one at `PERSIST_TEMP_STATE_EVERY_EPOCHS` = 1024
     * ```
     *        |                |             |           .
     * epoch - 1024*2    epoch - 1024    epoch - 32    epoch
     * ```
     */
    maybeArchiveState(finalized: CheckpointWithHex): Promise<void>;
    /**
     * Archives finalized states from active bucket to archive bucket.
     * Only the new finalized state is stored to disk
     */
    archiveState(finalized: CheckpointWithHex): Promise<void>;
}
/**
 * Keeps first epoch per interval of persistEveryEpochs, deletes the rest
 */
export declare function computeEpochsToDelete(storedEpochs: number[], persistEveryEpochs: number): number[];
//# sourceMappingURL=archiveStates.d.ts.map