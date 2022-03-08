"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackfillSync = exports.BackfillSyncStatus = exports.BackfillSyncMethod = exports.BackfillSyncEvent = void 0;
const events_1 = require("events");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const ssz_1 = require("@chainsafe/ssz");
const constants_1 = require("../../constants");
const network_1 = require("../../network");
const itTrigger_1 = require("../../util/itTrigger");
const peerMap_1 = require("../../util/peerMap");
const shuffle_1 = require("../../util/shuffle");
const errors_1 = require("./errors");
const verify_1 = require("./verify");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const bytes_1 = require("../../util/bytes");
const initState_1 = require("../../chain/initState");
/**
 * Timeout in ms to take a break from reading a backfillBatchSize from db, as just yielding
 * to sync loop gives hardly any.
 */
const DB_READ_BREATHER_TIMEOUT = 1000;
var BackfillSyncEvent;
(function (BackfillSyncEvent) {
    BackfillSyncEvent["completed"] = "BackfillSync-completed";
})(BackfillSyncEvent = exports.BackfillSyncEvent || (exports.BackfillSyncEvent = {}));
var BackfillSyncMethod;
(function (BackfillSyncMethod) {
    BackfillSyncMethod["database"] = "database";
    BackfillSyncMethod["backfilled_ranges"] = "backfilled_ranges";
    BackfillSyncMethod["rangesync"] = "rangesync";
    BackfillSyncMethod["blockbyroot"] = "blockbyroot";
})(BackfillSyncMethod = exports.BackfillSyncMethod || (exports.BackfillSyncMethod = {}));
var BackfillSyncStatus;
(function (BackfillSyncStatus) {
    BackfillSyncStatus["pending"] = "pending";
    BackfillSyncStatus["syncing"] = "syncing";
    BackfillSyncStatus["completed"] = "completed";
    BackfillSyncStatus["aborted"] = "aborted";
})(BackfillSyncStatus = exports.BackfillSyncStatus || (exports.BackfillSyncStatus = {}));
/** Map a SyncState to an integer for rendering in Grafana */
const syncStatus = {
    [BackfillSyncStatus.aborted]: 0,
    [BackfillSyncStatus.pending]: 1,
    [BackfillSyncStatus.syncing]: 2,
    [BackfillSyncStatus.completed]: 3,
};
class BackfillSync extends events_1.EventEmitter {
    constructor(opts, modules) {
        super();
        this.wsValidated = false;
        this.processor = new itTrigger_1.ItTrigger();
        this.peers = new peerMap_1.PeerSet();
        this.status = BackfillSyncStatus.pending;
        this.addPeer = (peerId, peerStatus) => {
            var _a, _b;
            const requiredSlot = (_b = (_a = this.syncAnchor.lastBackSyncedBlock) === null || _a === void 0 ? void 0 : _a.slot) !== null && _b !== void 0 ? _b : this.backfillStartFromSlot;
            this.logger.debug("Add peer", { peerhead: peerStatus.headSlot, requiredSlot });
            if (peerStatus.headSlot >= requiredSlot) {
                this.peers.add(peerId);
                this.processor.trigger();
            }
        };
        this.removePeer = (peerId) => {
            this.peers.delete(peerId);
        };
        this.syncAnchor = modules.syncAnchor;
        this.backfillStartFromSlot = modules.backfillStartFromSlot;
        this.backfillRangeWrittenSlot = modules.backfillRangeWrittenSlot;
        this.prevFinalizedCheckpointBlock = modules.prevFinalizedCheckpointBlock;
        this.wsCheckpointHeader = modules.wsCheckpointHeader;
        this.chain = modules.chain;
        this.network = modules.network;
        this.db = modules.db;
        this.config = modules.config;
        this.logger = modules.logger;
        this.metrics = modules.metrics;
        this.opts = opts;
        this.network.events.on(network_1.NetworkEvent.peerConnected, this.addPeer);
        this.network.events.on(network_1.NetworkEvent.peerDisconnected, this.removePeer);
        this.signal = modules.signal;
        this.sync()
            .then((oldestSlotSynced) => {
            if (this.status !== BackfillSyncStatus.completed) {
                throw new lodestar_utils_1.ErrorAborted(`Invalid BackfillSyncStatus at the completion of sync loop status=${this.status}`);
            }
            this.emit(BackfillSyncEvent.completed, oldestSlotSynced);
            this.logger.info("BackfillSync completed", { oldestSlotSynced });
            // Sync completed, unsubscribe listeners and don't run the processor again.
            // Backfill is never necessary again until the node shuts down
            this.close();
        })
            .catch((e) => {
            this.logger.error("BackfillSync processor error", e);
            this.status = BackfillSyncStatus.aborted;
            this.close();
        });
        const metrics = this.metrics;
        if (metrics) {
            metrics.backfillSync.status.addCollect(() => metrics.backfillSync.status.set(syncStatus[this.status]));
            metrics.backfillSync.backfilledTillSlot.addCollect(() => {
                var _a, _b;
                return metrics.backfillSync.backfilledTillSlot.set((_b = (_a = this.syncAnchor.lastBackSyncedBlock) === null || _a === void 0 ? void 0 : _a.slot) !== null && _b !== void 0 ? _b : this.backfillStartFromSlot);
            });
            metrics.backfillSync.prevFinOrWsSlot.addCollect(() => metrics.backfillSync.prevFinOrWsSlot.set(Math.max(this.prevFinalizedCheckpointBlock.slot, constants_1.GENESIS_SLOT)));
        }
    }
    /**
     * Use the root of the anchorState of the beacon node as the starting point of the
     * backfill sync with its expected slot to be anchorState.slot, which will be
     * validated once the block is resolved in the backfill sync.
     *
     * NOTE: init here is quite light involving couple of
     *
     *   1. db keys lookup in stateArchive/backfilledRanges
     *   2. computing root(s) for anchorBlockRoot and prevFinalizedCheckpointBlock
     *
     * The way we initialize beacon node, wsCheckpoint's slot is always <= anchorSlot
     * If:
     *   the root belonging to wsCheckpoint is in the DB, we need to verify linkage to it
     *   i.e. it becomes our first prevFinalizedCheckpointBlock
     * Else
     *   we initialize prevFinalizedCheckpointBlock from the last stored db finalized state
     *   for verification and when we go below its epoch we just check if a correct block
     *   corresponding to wsCheckpoint root was stored.
     *
     * and then we continue going back and verifying the next unconnected previous finalized
     * or wsCheckpoints identifiable as the keys of backfill sync.
     */
    static async init(opts, modules) {
        const { config, anchorState, db, wsCheckpoint, logger } = modules;
        const { checkpoint: anchorCp } = (0, initState_1.computeAnchorCheckpoint)(config, anchorState);
        const anchorSlot = anchorState.latestBlockHeader.slot;
        const syncAnchor = {
            anchorBlock: null,
            anchorBlockRoot: anchorCp.root,
            anchorSlot,
            lastBackSyncedBlock: null,
        };
        // Load the previous written to slot for the key  backfillStartFromSlot
        // in backfilledRanges
        const backfillStartFromSlot = anchorSlot;
        const backfillRangeWrittenSlot = await db.backfilledRanges.get(backfillStartFromSlot);
        const previousBackfilledRanges = await db.backfilledRanges.entries({
            lte: backfillStartFromSlot,
        });
        modules.logger.info("Initializing from Checkpoint", {
            root: (0, ssz_1.toHexString)(anchorCp.root),
            epoch: anchorCp.epoch,
            backfillStartFromSlot,
            previousBackfilledRanges: JSON.stringify(previousBackfilledRanges),
        });
        // wsCheckpointHeader is where the checkpoint can actually be validated
        const wsCheckpointHeader = wsCheckpoint
            ? { root: wsCheckpoint.root, slot: wsCheckpoint.epoch * lodestar_params_1.SLOTS_PER_EPOCH }
            : null;
        // Load a previous finalized or wsCheckpoint slot from DB below anchorSlot
        const prevFinalizedCheckpointBlock = await extractPreviousFinOrWsCheckpoint(config, db, anchorSlot, logger);
        return new this(opts, {
            syncAnchor,
            backfillStartFromSlot,
            backfillRangeWrittenSlot,
            wsCheckpointHeader,
            prevFinalizedCheckpointBlock,
            ...modules,
        });
    }
    /** Throw / return all AsyncGenerators */
    close() {
        this.network.events.off(network_1.NetworkEvent.peerConnected, this.addPeer);
        this.network.events.off(network_1.NetworkEvent.peerDisconnected, this.removePeer);
        this.processor.end(new lodestar_utils_1.ErrorAborted("BackfillSync"));
    }
    /**
     * @returns Returns oldestSlotSynced
     */
    async sync() {
        var _a;
        this.processor.trigger();
        for await (const _ of this.processor) {
            if (this.status === BackfillSyncStatus.aborted) {
                /** Break out of sync loop and throw error */
                break;
            }
            this.status = BackfillSyncStatus.syncing;
            // 1. We should always have either anchorBlock or anchorBlockRoot, they are the
            //    anchor points for this round of the sync
            // 2. Check and validate if we have reached prevFinalizedCheckpointBlock
            //    On success Update prevFinalizedCheckpointBlock to check the *next* previous
            // 3. Validate Checkpoint as part of DB block tree if we have backfilled
            //    before the checkpoint
            // 4. Exit the sync if backfilled till genesis
            //
            // 5. Check if we can jump back from available backfill sequence, if found yield and
            //    recontinue from top making checks
            // 7. Check and read batchSize from DB, if found yield and recontinue from top
            // 8. If not in DB, and if peer available
            //    a) Either fetch blockByRoot if only anchorBlockRoot is set, which could be because
            //       i) its the unavailable root of the very first block to start off sync
            //       ii) its parent of lastBackSyncedBlock and there was an issue in establishing
            //           linear sequence in syncRange as there could be one or more
            //           skipped/orphaned slots
            //           between the parent we want to fetch and lastBackSyncedBlock
            //    b) read previous batchSize blocks from network assuming most likely those blocks
            //       form a linear anchored chain with anchorBlock. If not, try fetching the
            //       parent of
            //       the anchorBlock via strategy a) as it could be multiple skipped/orphaned slots
            //       behind
            if (this.syncAnchor.lastBackSyncedBlock != null) {
                // If after a previous sync round:
                //   lastBackSyncedBlock.slot < prevFinalizedCheckpointBlock.slot
                // then it means the prevFinalizedCheckpoint block has been missed because in each
                // round we backfill new blocks till (if the batchSize allows):
                // lastBackSyncedBlock.slot <= prevFinalizedCheckpointBlock.slot
                if (this.syncAnchor.lastBackSyncedBlock.slot < this.prevFinalizedCheckpointBlock.slot) {
                    this.logger.error(`Backfilled till ${this.syncAnchor.lastBackSyncedBlock.slot} but not found previous saved finalized or wsCheckpoint with root=${(0, ssz_1.toHexString)(this.prevFinalizedCheckpointBlock.root)}, slot=${this.prevFinalizedCheckpointBlock.slot}`);
                    // Break sync loop and throw error
                    break;
                }
                if (this.syncAnchor.lastBackSyncedBlock.slot === this.prevFinalizedCheckpointBlock.slot) {
                    // Okay! we backfilled successfully till prevFinalizedCheckpointBlock
                    if (!(0, bytes_1.byteArrayEquals)(this.syncAnchor.lastBackSyncedBlock.root, this.prevFinalizedCheckpointBlock.root)) {
                        this.logger.error(`Invalid root synced at a previous finalized or wsCheckpoint, slot=${this.prevFinalizedCheckpointBlock.slot}: expected=${(0, ssz_1.toHexString)(this.prevFinalizedCheckpointBlock.root)}, actual=${(0, ssz_1.toHexString)(this.syncAnchor.lastBackSyncedBlock.root)}`);
                        // Break sync loop and throw error
                        break;
                    }
                    this.logger.verbose("Validated current prevFinalizedCheckpointBlock", {
                        root: (0, ssz_1.toHexString)(this.prevFinalizedCheckpointBlock.root),
                        slot: this.prevFinalizedCheckpointBlock.slot,
                    });
                    // 1. If this is not a genesis block save this block in DB as this wasn't saved
                    //    earlier pending validation. Genesis block will be saved with extra validation
                    //    before returning from the sync.
                    //
                    // 2. Load another previous saved finalized or wsCheckpoint which has not
                    //    been validated yet. These are the keys of backfill ranges as each
                    //    range denotes
                    //    a validated connected segment having the slots of previous wsCheckpoint
                    //    or finalized as keys
                    if (this.syncAnchor.lastBackSyncedBlock.slot !== constants_1.GENESIS_SLOT) {
                        await this.db.blockArchive.put(this.syncAnchor.lastBackSyncedBlock.slot, this.syncAnchor.lastBackSyncedBlock.block);
                    }
                    this.prevFinalizedCheckpointBlock = await extractPreviousFinOrWsCheckpoint(this.config, this.db, this.syncAnchor.lastBackSyncedBlock.slot, this.logger);
                }
                if (this.syncAnchor.lastBackSyncedBlock.slot === constants_1.GENESIS_SLOT) {
                    if (!(0, bytes_1.byteArrayEquals)(this.syncAnchor.lastBackSyncedBlock.block.message.parentRoot, constants_1.ZERO_HASH)) {
                        Error(`Invalid Gensis Block with non zero parentRoot=${(0, ssz_1.toHexString)(this.syncAnchor.lastBackSyncedBlock.block.message.parentRoot)}`);
                    }
                    await this.db.blockArchive.put(constants_1.GENESIS_SLOT, this.syncAnchor.lastBackSyncedBlock.block);
                }
                if (this.wsCheckpointHeader && !this.wsValidated) {
                    await this.checkIfCheckpointSyncedAndValidate();
                }
                if (this.backfillRangeWrittenSlot === null ||
                    this.syncAnchor.lastBackSyncedBlock.slot < this.backfillRangeWrittenSlot) {
                    this.backfillRangeWrittenSlot = this.syncAnchor.lastBackSyncedBlock.slot;
                    await this.db.backfilledRanges.put(this.backfillStartFromSlot, this.backfillRangeWrittenSlot);
                    this.logger.debug(`Updated the backfill range from=${this.backfillStartFromSlot} till=${this.backfillRangeWrittenSlot}`);
                }
                if (this.syncAnchor.lastBackSyncedBlock.slot === constants_1.GENESIS_SLOT) {
                    this.logger.verbose("Successfully synced to genesis.");
                    this.status = BackfillSyncStatus.completed;
                    return constants_1.GENESIS_SLOT;
                }
                const foundValidSeq = await this.checkUpdateFromBackfillSequences();
                if (foundValidSeq) {
                    // Go back to top and do checks till
                    this.processor.trigger();
                    continue;
                }
            }
            try {
                const foundBlocks = await this.fastBackfillDb();
                if (foundBlocks) {
                    this.processor.trigger();
                    continue;
                }
            }
            catch (e) {
                this.logger.error("Error while reading from DB", {}, e);
                // Break sync loop and throw error
                break;
            }
            // Try the network if nothing found in DB
            const peer = (0, shuffle_1.shuffleOne)(this.peers.values());
            if (!peer) {
                this.status = BackfillSyncStatus.pending;
                this.logger.debug("No peers yet");
                continue;
            }
            try {
                if (!this.syncAnchor.anchorBlock) {
                    await this.syncBlockByRoot(peer, this.syncAnchor.anchorBlockRoot);
                    // Go back and make the checks in case this block could be at or
                    // behind prevFinalizedCheckpointBlock
                }
                else {
                    await this.syncRange(peer);
                    // Go back and make the checks in case the lastbackSyncedBlock could be at or
                    // behind prevFinalizedCheckpointBlock
                }
            }
            catch (e) {
                (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.backfillSync.errors.inc();
                this.logger.error("Sync error", {}, e);
                if (e instanceof errors_1.BackfillSyncError) {
                    switch (e.type.code) {
                        case errors_1.BackfillSyncErrorCode.INTERNAL_ERROR:
                            // Break it out of the loop and throw error
                            this.status = BackfillSyncStatus.aborted;
                            break;
                        case errors_1.BackfillSyncErrorCode.NOT_ANCHORED:
                        case errors_1.BackfillSyncErrorCode.NOT_LINEAR:
                            // Lets try to jump directly to the parent of this anchorBlock as previous
                            // (segment) of blocks could be orphaned/missed
                            if (this.syncAnchor.anchorBlock) {
                                this.syncAnchor = {
                                    anchorBlock: null,
                                    anchorBlockRoot: this.syncAnchor.anchorBlock.message.parentRoot,
                                    anchorSlot: null,
                                    lastBackSyncedBlock: this.syncAnchor.lastBackSyncedBlock,
                                };
                            }
                        // falls through
                        case errors_1.BackfillSyncErrorCode.INVALID_SIGNATURE:
                            this.network.reportPeer(peer, network_1.PeerAction.LowToleranceError, "BadSyncBlocks");
                    }
                }
            }
            finally {
                if (this.status !== BackfillSyncStatus.aborted)
                    this.processor.trigger();
            }
        }
        throw new lodestar_utils_1.ErrorAborted("BackfillSync");
    }
    /**
     * Ensure that any weak subjectivity checkpoint provided in past with respect
     * the initialization point is the same block tree as the DB once backfill
     */
    async checkIfCheckpointSyncedAndValidate() {
        if (this.syncAnchor.lastBackSyncedBlock == null) {
            throw Error("Invalid lastBackSyncedBlock for checkpoint validation");
        }
        if (this.wsCheckpointHeader == null) {
            throw Error("Invalid null checkpoint for validation");
        }
        if (this.wsValidated)
            return;
        if (this.wsCheckpointHeader.slot >= this.syncAnchor.lastBackSyncedBlock.slot) {
            // Checkpoint root should be in db now , in case there are string of orphaned/missed
            // slots before/leading up to checkpoint, the block just backsynced before the
            // wsCheckpointHeader.slot will have the checkpoint root
            const wsDbCheckpointBlock = await this.db.blockArchive.getByRoot(this.wsCheckpointHeader.root);
            if (!wsDbCheckpointBlock ||
                // The only validation we can do here is that wsDbCheckpointBlock is found at/before
                // wsCheckpoint's epoch as there could be orphaned/missed slots all the way
                // from wsDbCheckpointBlock's slot to the wsCheckpoint's epoch
                // TODO: one can verify the child of wsDbCheckpointBlock is at
                // slot > wsCheckpointHeader
                // Note: next epoch is at wsCheckpointHeader.slot + SLOTS_PER_EPOCH
                wsDbCheckpointBlock.message.slot >= this.wsCheckpointHeader.slot + lodestar_params_1.SLOTS_PER_EPOCH)
                // TODO: explode and stop the entire node
                throw new Error(`InvalidWsCheckpoint root=${this.wsCheckpointHeader.root}, epoch=${this.wsCheckpointHeader.slot / lodestar_params_1.SLOTS_PER_EPOCH}, ${wsDbCheckpointBlock
                    ? "found at epoch=" + Math.floor((wsDbCheckpointBlock === null || wsDbCheckpointBlock === void 0 ? void 0 : wsDbCheckpointBlock.message.slot) / lodestar_params_1.SLOTS_PER_EPOCH)
                    : "not found"}`);
            this.logger.info("wsCheckpoint validated!", {
                root: (0, ssz_1.toHexString)(this.wsCheckpointHeader.root),
                epoch: this.wsCheckpointHeader.slot / lodestar_params_1.SLOTS_PER_EPOCH,
            });
            this.wsValidated = true;
        }
    }
    async checkUpdateFromBackfillSequences() {
        var _a;
        if (this.syncAnchor.lastBackSyncedBlock === null) {
            throw Error("Backfill ranges can only be used once we have a valid lastBackSyncedBlock as a pivot point");
        }
        let validSequence = false;
        if (this.syncAnchor.lastBackSyncedBlock.slot === null)
            return validSequence;
        const lastBackSyncedSlot = this.syncAnchor.lastBackSyncedBlock.slot;
        const filteredSeqs = await this.db.backfilledRanges.entries({
            gte: lastBackSyncedSlot,
        });
        if (filteredSeqs.length > 0) {
            const jumpBackTo = Math.min(...filteredSeqs.map(({ value: justToSlot }) => justToSlot));
            if (jumpBackTo < lastBackSyncedSlot) {
                validSequence = true;
                const anchorBlock = await this.db.blockArchive.get(jumpBackTo);
                if (!anchorBlock) {
                    validSequence = false;
                    this.logger.warn(`Invalid backfill sequence: expected a block at ${jumpBackTo} in blockArchive, ignoring the sequence`);
                }
                if (anchorBlock && validSequence) {
                    if (this.prevFinalizedCheckpointBlock.slot >= jumpBackTo) {
                        this.logger.debug(`Found a sequence going back to ${jumpBackTo} before the previous finalized or wsCheckpoint`, { slot: this.prevFinalizedCheckpointBlock.slot });
                        // Everything saved in db between a backfilled range is a connected sequence
                        // we only need to check if prevFinalizedCheckpointBlock is in db
                        const prevBackfillCpBlock = await this.db.blockArchive.getByRoot(this.prevFinalizedCheckpointBlock.root);
                        if (prevBackfillCpBlock != null &&
                            this.prevFinalizedCheckpointBlock.slot === prevBackfillCpBlock.message.slot) {
                            this.logger.verbose("Validated current prevFinalizedCheckpointBlock", {
                                root: (0, ssz_1.toHexString)(this.prevFinalizedCheckpointBlock.root),
                                slot: prevBackfillCpBlock.message.slot,
                            });
                        }
                        else {
                            validSequence = false;
                            this.logger.warn(`Invalid backfill sequence: previous finalized or checkpoint block root=${this.prevFinalizedCheckpointBlock.root}, slot=${this.prevFinalizedCheckpointBlock.slot} ${prevBackfillCpBlock ? "found at slot=" + prevBackfillCpBlock.message.slot : "not found"}, ignoring the sequence`);
                        }
                    }
                }
                if (anchorBlock && validSequence) {
                    // Update the current sequence in DB as we will be cleaning up previous sequences
                    await this.db.backfilledRanges.put(this.backfillStartFromSlot, jumpBackTo);
                    this.backfillRangeWrittenSlot = jumpBackTo;
                    this.logger.verbose(`Jumped and updated the backfilled range ${this.backfillStartFromSlot}, ${this.backfillRangeWrittenSlot}`, { jumpBackTo });
                    const anchorBlockHeader = (0, lodestar_beacon_state_transition_1.blockToHeader)(this.config, anchorBlock.message);
                    const anchorBlockRoot = lodestar_types_1.ssz.phase0.BeaconBlockHeader.hashTreeRoot(anchorBlockHeader);
                    this.syncAnchor = {
                        anchorBlock,
                        anchorBlockRoot,
                        anchorSlot: jumpBackTo,
                        lastBackSyncedBlock: { root: anchorBlockRoot, slot: jumpBackTo, block: anchorBlock },
                    };
                    if (this.prevFinalizedCheckpointBlock.slot >= jumpBackTo) {
                        // prevFinalizedCheckpointBlock must have been validated, update to a
                        // new unverified
                        // finalized or wsCheckpoint behind the new lastBackSyncedBlock
                        this.prevFinalizedCheckpointBlock = await extractPreviousFinOrWsCheckpoint(this.config, this.db, jumpBackTo, this.logger);
                    }
                    (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.backfillSync.totalBlocks.inc({ method: BackfillSyncMethod.backfilled_ranges }, lastBackSyncedSlot - jumpBackTo);
                }
            }
        }
        // Only delete < backfillStartFromSlot, the keys greater than this would be cleaned
        // up by the archival process of forward sync
        const cleanupSeqs = filteredSeqs.filter((entry) => entry.key < this.backfillStartFromSlot);
        if (cleanupSeqs.length > 0) {
            await this.db.backfilledRanges.batchDelete(cleanupSeqs.map((entry) => entry.key));
            this.logger.debug(`Cleaned up the old sequences between ${this.backfillStartFromSlot},${this.syncAnchor.lastBackSyncedBlock}`, { cleanupSeqs: JSON.stringify(cleanupSeqs) });
        }
        return validSequence;
    }
    async fastBackfillDb() {
        var _a;
        // Block of this anchorBlockRoot can't be behind the prevFinalizedCheckpointBlock
        // as prevFinalizedCheckpointBlock can't be skipped
        let anchorBlockRoot;
        let expectedSlot = null;
        if (this.syncAnchor.anchorBlock) {
            anchorBlockRoot = this.syncAnchor.anchorBlock.message.parentRoot;
        }
        else {
            anchorBlockRoot = this.syncAnchor.anchorBlockRoot;
            expectedSlot = this.syncAnchor.anchorSlot;
        }
        let anchorBlock = await this.db.blockArchive.getByRoot(anchorBlockRoot);
        if (!anchorBlock)
            return false;
        if (expectedSlot !== null && anchorBlock.message.slot !== expectedSlot)
            throw Error(`Invalid slot of anchorBlock read from DB with root=${anchorBlockRoot}, expected=${expectedSlot}, actual=${anchorBlock.message.slot}`);
        // If possible, read back till anchorBlock > this.prevFinalizedCheckpointBlock
        let parentBlock, backCount = 1;
        let isPrevFinWsConfirmedAnchorParent = false;
        while (backCount !== this.opts.backfillBatchSize &&
            (parentBlock = await this.db.blockArchive.getByRoot(anchorBlock.message.parentRoot))) {
            // Before moving anchorBlock back, we need check for prevFinalizedCheckpointBlock
            if (anchorBlock.message.slot < this.prevFinalizedCheckpointBlock.slot) {
                throw Error(`Skipped a prevFinalizedCheckpointBlock with slot=${this.prevFinalizedCheckpointBlock}, root=${(0, ssz_1.toHexString)(this.prevFinalizedCheckpointBlock.root)}`);
            }
            if (anchorBlock.message.slot === this.prevFinalizedCheckpointBlock.slot) {
                if (!isPrevFinWsConfirmedAnchorParent &&
                    !(0, bytes_1.byteArrayEquals)(anchorBlockRoot, this.prevFinalizedCheckpointBlock.root)) {
                    throw Error(`Invalid root for prevFinalizedCheckpointBlock at slot=${this.prevFinalizedCheckpointBlock.slot}, expected=${(0, ssz_1.toHexString)(this.prevFinalizedCheckpointBlock.root)}, found=${anchorBlockRoot}`);
                }
                // If the new parentBlock is just one slot back, we can safely assign
                // prevFinalizedCheckpointBlock with the parentBlock and skip root
                // validation in next iteration. Else we need to extract
                // prevFinalizedCheckpointBlock
                if (parentBlock.message.slot === anchorBlock.message.slot - 1) {
                    this.prevFinalizedCheckpointBlock = { root: anchorBlock.message.parentRoot, slot: parentBlock.message.slot };
                    isPrevFinWsConfirmedAnchorParent = true;
                }
                else {
                    // Extract new prevFinalizedCheckpointBlock below anchorBlock
                    this.prevFinalizedCheckpointBlock = await extractPreviousFinOrWsCheckpoint(this.config, this.db, anchorBlock.message.slot, this.logger);
                    isPrevFinWsConfirmedAnchorParent = false;
                }
            }
            anchorBlockRoot = anchorBlock.message.parentRoot;
            anchorBlock = parentBlock;
            backCount++;
        }
        this.syncAnchor = {
            anchorBlock,
            anchorBlockRoot,
            anchorSlot: anchorBlock.message.slot,
            lastBackSyncedBlock: { root: anchorBlockRoot, slot: anchorBlock.message.slot, block: anchorBlock },
        };
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.backfillSync.totalBlocks.inc({ method: BackfillSyncMethod.database }, backCount);
        this.logger.verbose(`Read ${backCount} blocks from DB till `, {
            slot: anchorBlock.message.slot,
        });
        if (backCount >= this.opts.backfillBatchSize) {
            // We should sleep as there seems to be more that can be read from db but yielding to
            // the sync loop hardly gives any breather to the beacon node
            await (0, lodestar_utils_1.sleep)(DB_READ_BREATHER_TIMEOUT, this.signal);
        }
        return true;
    }
    async syncBlockByRoot(peer, anchorBlockRoot) {
        var _a;
        const [anchorBlock] = await this.network.reqResp.beaconBlocksByRoot(peer, [anchorBlockRoot]);
        if (anchorBlock == null)
            throw new Error("InvalidBlockSyncedFromPeer");
        // GENESIS_SLOT doesn't has valid signature
        if (anchorBlock.message.slot === constants_1.GENESIS_SLOT)
            return;
        await (0, verify_1.verifyBlockProposerSignature)(this.chain.bls, this.chain.getHeadState(), [anchorBlock]);
        // We can write to the disk if this is ahead of prevFinalizedCheckpointBlock otherwise
        // we will need to go make checks on the top of sync loop before writing as it might
        // override prevFinalizedCheckpointBlock
        if (this.prevFinalizedCheckpointBlock.slot < anchorBlock.message.slot)
            await this.db.blockArchive.put(anchorBlock.message.slot, anchorBlock);
        this.syncAnchor = {
            anchorBlock,
            anchorBlockRoot,
            anchorSlot: anchorBlock.message.slot,
            lastBackSyncedBlock: { root: anchorBlockRoot, slot: anchorBlock.message.slot, block: anchorBlock },
        };
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.backfillSync.totalBlocks.inc({ method: BackfillSyncMethod.blockbyroot });
        this.logger.verbose("Fetched new anchorBlock", {
            root: (0, ssz_1.toHexString)(anchorBlockRoot),
            slot: anchorBlock.message.slot,
        });
        return;
    }
    async syncRange(peer) {
        var _a;
        if (!this.syncAnchor.anchorBlock) {
            throw Error("Invalid anchorBlock null for syncRange");
        }
        const toSlot = this.syncAnchor.anchorBlock.message.slot;
        const fromSlot = Math.max(toSlot - this.opts.backfillBatchSize, this.prevFinalizedCheckpointBlock.slot, constants_1.GENESIS_SLOT);
        const blocks = await this.network.reqResp.beaconBlocksByRange(peer, {
            startSlot: fromSlot,
            count: toSlot - fromSlot,
            step: 1,
        });
        const anchorParentRoot = this.syncAnchor.anchorBlock.message.parentRoot;
        if (blocks.length === 0) {
            // Lets just directly try to jump to anchorParentRoot
            this.syncAnchor = {
                anchorBlock: null,
                anchorBlockRoot: anchorParentRoot,
                anchorSlot: null,
                lastBackSyncedBlock: this.syncAnchor.lastBackSyncedBlock,
            };
            return;
        }
        const { nextAnchor, verifiedBlocks, error } = (0, verify_1.verifyBlockSequence)(this.config, blocks, anchorParentRoot);
        // If any of the block's proposer signature fail, we can't trust this peer at all
        if (verifiedBlocks.length > 0) {
            await (0, verify_1.verifyBlockProposerSignature)(this.chain.bls, this.chain.getHeadState(), verifiedBlocks);
            // This is bad, like super bad. Abort the backfill
            if (!nextAnchor)
                throw new errors_1.BackfillSyncError({
                    code: errors_1.BackfillSyncErrorCode.INTERNAL_ERROR,
                    reason: "Invalid verifyBlockSequence result",
                });
            // Verified blocks are in reverse order with the nextAnchor being the smallest slot
            // if nextAnchor is on the same slot as prevFinalizedCheckpointBlock, we can't save
            // it before returning to top of sync loop for validation
            await this.db.blockArchive.batchAdd(nextAnchor.slot > this.prevFinalizedCheckpointBlock.slot
                ? verifiedBlocks
                : verifiedBlocks.slice(0, verifiedBlocks.length - 1));
            (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.backfillSync.totalBlocks.inc({ method: BackfillSyncMethod.rangesync }, verifiedBlocks.length);
        }
        // If nextAnchor provided, found some linear anchored blocks
        if (nextAnchor !== null) {
            this.syncAnchor = {
                anchorBlock: nextAnchor.block,
                anchorBlockRoot: nextAnchor.root,
                anchorSlot: nextAnchor.slot,
                lastBackSyncedBlock: nextAnchor,
            };
            this.logger.verbose(`syncRange discovered ${verifiedBlocks.length} valid blocks`, {
                backfilled: this.syncAnchor.lastBackSyncedBlock.slot,
            });
        }
        if (error)
            throw new errors_1.BackfillSyncError({ code: error });
    }
}
exports.BackfillSync = BackfillSync;
async function extractPreviousFinOrWsCheckpoint(config, db, belowSlot, logger) {
    // Anything below genesis block is just zero hash
    if (belowSlot <= constants_1.GENESIS_SLOT)
        return { root: constants_1.ZERO_HASH, slot: belowSlot - 1 };
    // To extract the next prevFinalizedCheckpointBlock, we just need to look back in DB
    // Any saved previous finalized or ws checkpoint, will also have a corresponding block
    // saved in DB, as we make sure of that
    //   1. When we archive new finalized state and blocks
    //   2. When we backfill from a wsCheckpoint
    const nextPrevFinOrWsBlock = (await db.blockArchive.values({
        lt: belowSlot,
        reverse: true,
        limit: 1,
    }))[0];
    let prevFinalizedCheckpointBlock;
    if (nextPrevFinOrWsBlock != null) {
        const header = (0, lodestar_beacon_state_transition_1.blockToHeader)(config, nextPrevFinOrWsBlock.message);
        const root = lodestar_types_1.ssz.phase0.BeaconBlockHeader.hashTreeRoot(header);
        prevFinalizedCheckpointBlock = { root, slot: nextPrevFinOrWsBlock.message.slot };
        logger === null || logger === void 0 ? void 0 : logger.debug("Extracted new prevFinalizedCheckpointBlock as potential previous finalized or wsCheckpoint", {
            root: (0, ssz_1.toHexString)(prevFinalizedCheckpointBlock.root),
            slot: prevFinalizedCheckpointBlock.slot,
        });
    }
    else {
        // GENESIS_SLOT -1 is the placeholder for parentHash of the genesis block
        // which should always be ZERO_HASH.
        prevFinalizedCheckpointBlock = { root: constants_1.ZERO_HASH, slot: constants_1.GENESIS_SLOT - 1 };
    }
    return prevFinalizedCheckpointBlock;
}
//# sourceMappingURL=backfill.js.map