"use strict";
/**
 * @module tasks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeEpochsToDelete = exports.StatesArchiver = exports.PERSIST_STATE_EVERY_EPOCHS = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
/**
 * Minimum number of epochs between archived states
 */
exports.PERSIST_STATE_EVERY_EPOCHS = 1024;
/**
 * Minimum number of epochs between single temp archived states
 * These states will be pruned once a new state is persisted
 */
const PERSIST_TEMP_STATE_EVERY_EPOCHS = 32;
/**
 * Archives finalized states from active bucket to archive bucket.
 *
 * Only the new finalized state is stored to disk
 */
class StatesArchiver {
    constructor(checkpointStateCache, db, logger) {
        this.checkpointStateCache = checkpointStateCache;
        this.db = db;
        this.logger = logger;
    }
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
    async maybeArchiveState(finalized) {
        const lastStoredSlot = await this.db.stateArchive.lastKey();
        const lastStoredEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(lastStoredSlot !== null && lastStoredSlot !== void 0 ? lastStoredSlot : 0);
        if (finalized.epoch - lastStoredEpoch > PERSIST_TEMP_STATE_EVERY_EPOCHS) {
            await this.archiveState(finalized);
            const storedEpochs = await this.db.stateArchive.keys({
                lt: finalized.epoch,
                // Only check the current and previous intervals
                gte: Math.max(0, (Math.floor(finalized.epoch / exports.PERSIST_STATE_EVERY_EPOCHS) - 1) * exports.PERSIST_STATE_EVERY_EPOCHS),
            });
            const statesToDelete = computeEpochsToDelete(storedEpochs, exports.PERSIST_STATE_EVERY_EPOCHS);
            if (statesToDelete.length > 0) {
                await this.db.stateArchive.batchDelete(statesToDelete);
            }
        }
    }
    /**
     * Archives finalized states from active bucket to archive bucket.
     * Only the new finalized state is stored to disk
     */
    async archiveState(finalized) {
        const finalizedState = this.checkpointStateCache.get(finalized);
        if (!finalizedState) {
            throw Error("No state in cache for finalized checkpoint state epoch #" + finalized.epoch);
        }
        await this.db.stateArchive.put(finalizedState.slot, finalizedState);
        // don't delete states before the finalized state, auto-prune will take care of it
        this.logger.verbose("Archive states completed", { finalizedEpoch: finalized.epoch });
    }
}
exports.StatesArchiver = StatesArchiver;
/**
 * Keeps first epoch per interval of persistEveryEpochs, deletes the rest
 */
function computeEpochsToDelete(storedEpochs, persistEveryEpochs) {
    const epochBuckets = new Set();
    const toDelete = new Set();
    for (const epoch of storedEpochs) {
        const epochBucket = epoch - (epoch % persistEveryEpochs);
        if (epochBuckets.has(epochBucket)) {
            toDelete.add(epoch);
        }
        else {
            epochBuckets.add(epochBucket);
        }
    }
    return Array.from(toDelete.values());
}
exports.computeEpochsToDelete = computeEpochsToDelete;
//# sourceMappingURL=archiveStates.js.map