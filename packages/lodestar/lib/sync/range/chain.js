"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldReportPeerOnBatchError = exports.SyncChain = exports.SyncChainStatus = exports.SyncChainStartError = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const ssz_1 = require("@chainsafe/ssz");
const network_1 = require("../../network");
const errors_1 = require("../../chain/errors");
const itTrigger_1 = require("../../util/itTrigger");
const bytes_1 = require("../../util/bytes");
const peerMap_1 = require("../../util/peerMap");
const wrapError_1 = require("../../util/wrapError");
const constants_1 = require("../constants");
const batch_1 = require("./batch");
const utils_1 = require("./utils");
class SyncChainStartError extends Error {
}
exports.SyncChainStartError = SyncChainStartError;
var SyncChainStatus;
(function (SyncChainStatus) {
    SyncChainStatus["Stopped"] = "Stopped";
    SyncChainStatus["Syncing"] = "Syncing";
    SyncChainStatus["Synced"] = "Synced";
    SyncChainStatus["Error"] = "Error";
})(SyncChainStatus = exports.SyncChainStatus || (exports.SyncChainStatus = {}));
/**
 * Dynamic target sync chain. Peers with multiple targets but with the same syncType are added
 * through the `addPeer()` hook.
 *
 * A chain of blocks that need to be downloaded. Peers who claim to contain the target head
 * root are grouped into the peer pool and queried for batches when downloading the chain.
 */
class SyncChain {
    constructor(startEpoch, initialTarget, syncType, fns, modules, opts) {
        var _a;
        /** Number of validated epochs. For the SyncRange to prevent switching chains too fast */
        this.validatedEpochs = 0;
        this.status = SyncChainStatus.Stopped;
        /** AsyncIterable that guarantees processChainSegment is run only at once at anytime */
        this.batchProcessor = new itTrigger_1.ItTrigger();
        /** Sorted map of batches undergoing some kind of processing. */
        this.batches = new Map();
        this.peerset = new peerMap_1.PeerMap();
        this.startEpoch = startEpoch;
        this.target = initialTarget;
        this.syncType = syncType;
        this.processChainSegment = fns.processChainSegment;
        this.downloadBeaconBlocksByRange = fns.downloadBeaconBlocksByRange;
        this.reportPeer = fns.reportPeer;
        this.config = modules.config;
        this.logger = modules.logger;
        this.opts = { epochsPerBatch: (_a = opts === null || opts === void 0 ? void 0 : opts.epochsPerBatch) !== null && _a !== void 0 ? _a : constants_1.EPOCHS_PER_BATCH };
        this.logId = `${syncType}`;
        // Trigger event on parent class
        this.sync().then(() => fns.onEnd(null, this.target), (e) => fns.onEnd(e, null));
    }
    /**
     * Start syncing a new chain or an old one with an existing peer list
     * In the same call, advance the chain if localFinalizedEpoch >
     */
    startSyncing(localFinalizedEpoch) {
        switch (this.status) {
            case SyncChainStatus.Stopped:
                break; // Ok, continue
            case SyncChainStatus.Syncing:
                return; // Skip, already started
            case SyncChainStatus.Error:
            case SyncChainStatus.Synced:
                throw new SyncChainStartError(`Attempted to start an ended SyncChain ${this.status}`);
        }
        this.status = SyncChainStatus.Syncing;
        // to avoid dropping local progress, we advance the chain with its batch boundaries.
        // get the aligned epoch that produces a batch containing the `localFinalizedEpoch`
        const localFinalizedEpochAligned = this.startEpoch + Math.floor((localFinalizedEpoch - this.startEpoch) / constants_1.EPOCHS_PER_BATCH) * constants_1.EPOCHS_PER_BATCH;
        this.advanceChain(localFinalizedEpochAligned);
        // Potentially download new batches and process pending
        this.triggerBatchDownloader();
        this.triggerBatchProcessor();
    }
    /**
     * Temporarily stop the chain. Will prevent batches from being processed
     */
    stopSyncing() {
        this.status = SyncChainStatus.Stopped;
    }
    /**
     * Permanently remove this chain. Throws the main AsyncIterable
     */
    remove() {
        this.batchProcessor.end(new lodestar_utils_1.ErrorAborted("SyncChain"));
    }
    /**
     * Add peer to the chain and request batches if active
     */
    addPeer(peer, target) {
        this.peerset.set(peer, target);
        this.computeTarget();
        this.triggerBatchDownloader();
    }
    /**
     * Returns true if the peer existed and has been removed
     * NOTE: The RangeSync will take care of deleting the SyncChain if peers = 0
     */
    removePeer(peerId) {
        const deleted = this.peerset.delete(peerId);
        this.computeTarget();
        return deleted;
    }
    /**
     * Helper to print internal state for debugging when chain gets stuck
     */
    getBatchesState() {
        return (0, utils_1.toArr)(this.batches).map((batch) => batch.getMetadata());
    }
    get startEpochValue() {
        return this.startEpoch;
    }
    get isSyncing() {
        return this.status === SyncChainStatus.Syncing;
    }
    get isRemovable() {
        return this.status === SyncChainStatus.Error || this.status === SyncChainStatus.Synced;
    }
    get peers() {
        return this.peerset.size;
    }
    getPeers() {
        return this.peerset.keys();
    }
    /** Full debug state for lodestar API */
    getDebugState() {
        return {
            targetRoot: (0, ssz_1.toHexString)(this.target.root),
            targetSlot: this.target.slot,
            syncType: this.syncType,
            status: this.status,
            startEpoch: this.startEpoch,
            peers: this.peers,
            batches: this.getBatchesState(),
        };
    }
    computeTarget() {
        if (this.peerset.size > 0) {
            const targets = this.peerset.values();
            this.target = (0, utils_1.computeMostCommonTarget)(targets);
        }
    }
    /**
     * Main Promise that handles the sync process. Will resolve when initial sync completes
     * i.e. when it successfully processes a epoch >= than this chain `targetEpoch`
     */
    async sync() {
        try {
            // Start processing batches on demand in strict sequence
            for await (const _ of this.batchProcessor) {
                if (this.status !== SyncChainStatus.Syncing) {
                    continue;
                }
                // TODO: Consider running this check less often after the sync is well tested
                (0, utils_1.validateBatchesStatus)((0, utils_1.toArr)(this.batches));
                // If startEpoch of the next batch to be processed > targetEpoch -> Done
                const toBeProcessedEpoch = (0, utils_1.toBeProcessedStartEpoch)((0, utils_1.toArr)(this.batches), this.startEpoch, this.opts);
                if ((0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(toBeProcessedEpoch) >= this.target.slot) {
                    break;
                }
                // Processes the next batch if ready
                const batch = (0, utils_1.getNextBatchToProcess)((0, utils_1.toArr)(this.batches));
                if (batch)
                    await this.processBatch(batch);
            }
            this.status = SyncChainStatus.Synced;
            this.logger.verbose("SyncChain Synced", { id: this.logId });
        }
        catch (e) {
            if (e instanceof lodestar_utils_1.ErrorAborted) {
                return; // Ignore
            }
            this.status = SyncChainStatus.Error;
            this.logger.verbose("SyncChain Error", { id: this.logId }, e);
            // If a batch exceeds it's retry limit, maybe downscore peers.
            // shouldDownscoreOnBatchError() functions enforces that all BatchErrorCode values are covered
            if (e instanceof batch_1.BatchError) {
                const shouldReportPeer = shouldReportPeerOnBatchError(e.type.code);
                if (shouldReportPeer) {
                    for (const peer of this.peerset.keys()) {
                        this.reportPeer(peer, shouldReportPeer.action, shouldReportPeer.reason);
                    }
                }
            }
            throw e;
        }
    }
    /**
     * Request to process batches if possible
     */
    triggerBatchProcessor() {
        this.batchProcessor.trigger();
    }
    /**
     * Request to download batches if possible
     * Backlogs requests into a single pending request
     */
    triggerBatchDownloader() {
        try {
            this.requestBatches(this.peerset.keys());
        }
        catch (e) {
            // bubble the error up to the main async iterable loop
            this.batchProcessor.end(e);
        }
    }
    /**
     * Attempts to request the next required batches from the peer pool if the chain is syncing.
     * It will exhaust the peer pool and left over batches until the batch buffer is reached.
     */
    requestBatches(peers) {
        if (this.status !== SyncChainStatus.Syncing) {
            return;
        }
        const peerBalancer = new utils_1.ChainPeersBalancer(peers, (0, utils_1.toArr)(this.batches));
        // Retry download of existing batches
        for (const batch of this.batches.values()) {
            if (batch.state.status !== batch_1.BatchStatus.AwaitingDownload) {
                continue;
            }
            const peer = peerBalancer.bestPeerToRetryBatch(batch);
            if (peer) {
                void this.sendBatch(batch, peer);
            }
        }
        // find the next pending batch and request it from the peer
        for (const peer of peerBalancer.idlePeers()) {
            const batch = this.includeNextBatch();
            if (!batch) {
                break;
            }
            void this.sendBatch(batch, peer);
        }
    }
    /**
     * Creates the next required batch from the chain. If there are no more batches required, returns `null`.
     */
    includeNextBatch() {
        const batches = (0, utils_1.toArr)(this.batches);
        // Only request batches up to the buffer size limit
        // Note: Don't count batches in the AwaitingValidation state, to prevent stalling sync
        // if the current processing window is contained in a long range of skip slots.
        const batchesInBuffer = batches.filter((batch) => {
            return batch.state.status === batch_1.BatchStatus.Downloading || batch.state.status === batch_1.BatchStatus.AwaitingProcessing;
        });
        if (batchesInBuffer.length > constants_1.BATCH_BUFFER_SIZE) {
            return null;
        }
        // This line decides the starting epoch of the next batch. MUST ensure no duplicate batch for the same startEpoch
        const startEpoch = (0, utils_1.toBeDownloadedStartEpoch)(batches, this.startEpoch, this.opts);
        const toBeDownloadedSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(startEpoch) + constants_1.BATCH_SLOT_OFFSET;
        // Don't request batches beyond the target head slot
        if (toBeDownloadedSlot > this.target.slot) {
            return null;
        }
        if (this.batches.has(startEpoch)) {
            this.logger.error("Attempting to add existing Batch to SyncChain", { id: this.logId, startEpoch });
            return null;
        }
        const batch = new batch_1.Batch(startEpoch, this.config, this.opts);
        this.batches.set(startEpoch, batch);
        return batch;
    }
    /**
     * Requests the batch asigned to the given id from a given peer.
     */
    async sendBatch(batch, peer) {
        try {
            batch.startDownloading(peer);
            // wrapError ensures to never call both batch success() and batch error()
            const res = await (0, wrapError_1.wrapError)(this.downloadBeaconBlocksByRange(peer, batch.request));
            if (!res.err) {
                batch.downloadingSuccess(res.result);
                this.triggerBatchProcessor();
            }
            else {
                this.logger.verbose("Batch download error", { id: this.logId, ...batch.getMetadata() }, res.err);
                batch.downloadingError(); // Throws after MAX_DOWNLOAD_ATTEMPTS
            }
            // Pre-emptively request more blocks from peers whilst we process current blocks
            this.triggerBatchDownloader();
        }
        catch (e) {
            // bubble the error up to the main async iterable loop
            this.batchProcessor.end(e);
        }
        // Pre-emptively request more blocks from peers whilst we process current blocks
        this.triggerBatchDownloader();
    }
    /**
     * Sends `batch` to the processor. Note: batch may be empty
     */
    async processBatch(batch) {
        const blocks = batch.startProcessing();
        // wrapError ensures to never call both batch success() and batch error()
        const res = await (0, wrapError_1.wrapError)(this.processChainSegment(blocks, this.syncType));
        if (!res.err) {
            batch.processingSuccess();
            // If the processed batch is not empty, validate previous AwaitingValidation blocks.
            if (blocks.length > 0) {
                this.advanceChain(batch.startEpoch);
            }
            // Potentially process next AwaitingProcessing batch
            this.triggerBatchProcessor();
        }
        else {
            this.logger.verbose("Batch process error", { id: this.logId, ...batch.getMetadata() }, res.err);
            batch.processingError(res.err); // Throws after MAX_BATCH_PROCESSING_ATTEMPTS
            // At least one block was successfully verified and imported, so we can be sure all
            // previous batches are valid and we only need to download the current failed batch.
            if (res.err instanceof errors_1.ChainSegmentError && res.err.importedBlocks > 0) {
                this.advanceChain(batch.startEpoch);
            }
            // The current batch could not be processed, so either this or previous batches are invalid.
            // All previous batches (AwaitingValidation) are potentially faulty and marked for retry.
            // Progress will be drop back to `this.startEpoch`
            for (const pendingBatch of this.batches.values()) {
                if (pendingBatch.startEpoch < batch.startEpoch) {
                    this.logger.verbose("Batch validation error", { id: this.logId, ...pendingBatch.getMetadata() });
                    pendingBatch.validationError(res.err); // Throws after MAX_BATCH_PROCESSING_ATTEMPTS
                }
            }
        }
        // A batch is no longer in Processing status, queue has an empty spot to download next batch
        this.triggerBatchDownloader();
    }
    /**
     * Drops any batches previous to `newStartEpoch` and updates the chain boundaries
     */
    advanceChain(newStartEpoch) {
        // make sure this epoch produces an advancement
        if (newStartEpoch <= this.startEpoch) {
            return;
        }
        for (const [batchKey, batch] of this.batches.entries()) {
            if (batch.startEpoch < newStartEpoch) {
                this.batches.delete(batchKey);
                this.validatedEpochs += constants_1.EPOCHS_PER_BATCH;
                // The last batch attempt is right, all others are wrong. Penalize other peers
                const attemptOk = batch.validationSuccess();
                for (const attempt of batch.failedProcessingAttempts) {
                    if (!(0, bytes_1.byteArrayEquals)(attempt.hash, attemptOk.hash)) {
                        if (attemptOk.peer.toB58String() === attempt.peer.toB58String()) {
                            // The same peer corrected its previous attempt
                            this.reportPeer(attempt.peer, network_1.PeerAction.MidToleranceError, "SyncChainInvalidBatchSelf");
                        }
                        else {
                            // A different peer sent an bad batch
                            this.reportPeer(attempt.peer, network_1.PeerAction.LowToleranceError, "SyncChainInvalidBatchOther");
                        }
                    }
                }
            }
        }
        this.startEpoch = newStartEpoch;
    }
}
exports.SyncChain = SyncChain;
/**
 * Enforces that a report peer action is defined for all BatchErrorCode exhaustively.
 * If peer should not be downscored, returns null.
 */
function shouldReportPeerOnBatchError(code) {
    switch (code) {
        // A batch could not be processed after max retry limit. It's likely that all peers
        // in this chain are sending invalid batches repeatedly so are either malicious or faulty.
        // We drop the chain and report all peers.
        // There are some edge cases with forks that could cause this situation, but it's unlikely.
        case batch_1.BatchErrorCode.MAX_PROCESSING_ATTEMPTS:
            return { action: network_1.PeerAction.LowToleranceError, reason: "SyncChainMaxProcessingAttempts" };
        // TODO: Should peers be reported for MAX_DOWNLOAD_ATTEMPTS?
        case batch_1.BatchErrorCode.WRONG_STATUS:
        case batch_1.BatchErrorCode.MAX_DOWNLOAD_ATTEMPTS:
        case batch_1.BatchErrorCode.MAX_EXECUTION_ENGINE_ERROR_ATTEMPTS:
            return null;
    }
}
exports.shouldReportPeerOnBatchError = shouldReportPeerOnBatchError;
//# sourceMappingURL=chain.js.map