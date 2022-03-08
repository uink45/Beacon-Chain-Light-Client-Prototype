"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchError = exports.BatchErrorCode = exports.Batch = exports.BatchStatus = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const constants_1 = require("../constants");
const utils_1 = require("./utils");
const errors_1 = require("../../chain/errors");
/**
 * Current state of a batch
 */
var BatchStatus;
(function (BatchStatus) {
    /** The batch has failed either downloading or processing, but can be requested again. */
    BatchStatus["AwaitingDownload"] = "AwaitingDownload";
    /** The batch is being downloaded. */
    BatchStatus["Downloading"] = "Downloading";
    /** The batch has been completely downloaded and is ready for processing. */
    BatchStatus["AwaitingProcessing"] = "AwaitingProcessing";
    /** The batch is being processed. */
    BatchStatus["Processing"] = "Processing";
    /**
     * The batch was successfully processed and is waiting to be validated.
     *
     * It is not sufficient to process a batch successfully to consider it correct. This is
     * because batches could be erroneously empty, or incomplete. Therefore, a batch is considered
     * valid, only if the next sequential batch imports at least a block.
     */
    BatchStatus["AwaitingValidation"] = "AwaitingValidation";
})(BatchStatus = exports.BatchStatus || (exports.BatchStatus = {}));
/**
 * Batches are downloaded excluding the first block of the epoch assuming it has already been
 * downloaded.
 *
 * For example:
 *
 * Epoch boundary |                                   |
 *  ... | 30 | 31 | 32 | 33 | 34 | ... | 61 | 62 | 63 | 64 | 65 |
 *       Batch 1       |              Batch 2              |  Batch 3
 */
class Batch {
    constructor(startEpoch, config, opts) {
        /** State of the batch. */
        this.state = { status: BatchStatus.AwaitingDownload };
        /** The `Attempts` that have been made and failed to send us this batch. */
        this.failedProcessingAttempts = [];
        /** The `Attempts` that have been made and failed because of execution malfunction. */
        this.executionErrorAttempts = [];
        /** The number of download retries this batch has undergone due to a failed request. */
        this.failedDownloadAttempts = [];
        const startSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(startEpoch) + constants_1.BATCH_SLOT_OFFSET;
        const endSlot = startSlot + opts.epochsPerBatch * lodestar_params_1.SLOTS_PER_EPOCH;
        this.config = config;
        this.startEpoch = startEpoch;
        this.request = {
            startSlot: startSlot,
            count: endSlot - startSlot,
            step: 1,
        };
    }
    /**
     * Gives a list of peers from which this batch has had a failed download or processing attempt.
     */
    getFailedPeers() {
        return [...this.failedDownloadAttempts, ...this.failedProcessingAttempts.map((a) => a.peer)];
    }
    getMetadata() {
        return { startEpoch: this.startEpoch, status: this.state.status };
    }
    /**
     * AwaitingDownload -> Downloading
     */
    startDownloading(peer) {
        if (this.state.status !== BatchStatus.AwaitingDownload) {
            throw new BatchError(this.wrongStatusErrorType(BatchStatus.AwaitingDownload));
        }
        this.state = { status: BatchStatus.Downloading, peer };
    }
    /**
     * Downloading -> AwaitingProcessing
     */
    downloadingSuccess(blocks) {
        if (this.state.status !== BatchStatus.Downloading) {
            throw new BatchError(this.wrongStatusErrorType(BatchStatus.Downloading));
        }
        this.state = { status: BatchStatus.AwaitingProcessing, peer: this.state.peer, blocks };
    }
    /**
     * Downloading -> AwaitingDownload
     */
    downloadingError() {
        if (this.state.status !== BatchStatus.Downloading) {
            throw new BatchError(this.wrongStatusErrorType(BatchStatus.Downloading));
        }
        this.failedDownloadAttempts.push(this.state.peer);
        if (this.failedDownloadAttempts.length > constants_1.MAX_BATCH_DOWNLOAD_ATTEMPTS) {
            throw new BatchError(this.errorType({ code: BatchErrorCode.MAX_DOWNLOAD_ATTEMPTS }));
        }
        this.state = { status: BatchStatus.AwaitingDownload };
    }
    /**
     * AwaitingProcessing -> Processing
     */
    startProcessing() {
        if (this.state.status !== BatchStatus.AwaitingProcessing) {
            throw new BatchError(this.wrongStatusErrorType(BatchStatus.AwaitingProcessing));
        }
        const blocks = this.state.blocks;
        const hash = (0, utils_1.hashBlocks)(blocks, this.config); // tracks blocks to report peer on processing error
        this.state = { status: BatchStatus.Processing, attempt: { peer: this.state.peer, hash } };
        return blocks;
    }
    /**
     * Processing -> AwaitingValidation
     */
    processingSuccess() {
        if (this.state.status !== BatchStatus.Processing) {
            throw new BatchError(this.wrongStatusErrorType(BatchStatus.Processing));
        }
        this.state = { status: BatchStatus.AwaitingValidation, attempt: this.state.attempt };
    }
    /**
     * Processing -> AwaitingDownload
     */
    processingError(err) {
        if (this.state.status !== BatchStatus.Processing) {
            throw new BatchError(this.wrongStatusErrorType(BatchStatus.Processing));
        }
        if (err instanceof errors_1.ChainSegmentError && err.type.code === errors_1.BlockErrorCode.EXECUTION_ENGINE_ERROR) {
            this.onExecutionEngineError(this.state.attempt);
        }
        else {
            this.onProcessingError(this.state.attempt);
        }
    }
    /**
     * AwaitingValidation -> AwaitingDownload
     */
    validationError(err) {
        if (this.state.status !== BatchStatus.AwaitingValidation) {
            throw new BatchError(this.wrongStatusErrorType(BatchStatus.AwaitingValidation));
        }
        if (err instanceof errors_1.ChainSegmentError && err.type.code === errors_1.BlockErrorCode.EXECUTION_ENGINE_ERROR) {
            this.onExecutionEngineError(this.state.attempt);
        }
        else {
            this.onProcessingError(this.state.attempt);
        }
    }
    /**
     * AwaitingValidation -> Done
     */
    validationSuccess() {
        if (this.state.status !== BatchStatus.AwaitingValidation) {
            throw new BatchError(this.wrongStatusErrorType(BatchStatus.AwaitingValidation));
        }
        return this.state.attempt;
    }
    onExecutionEngineError(attempt) {
        this.executionErrorAttempts.push(attempt);
        if (this.executionErrorAttempts.length > constants_1.MAX_BATCH_PROCESSING_ATTEMPTS) {
            throw new BatchError(this.errorType({ code: BatchErrorCode.MAX_EXECUTION_ENGINE_ERROR_ATTEMPTS }));
        }
        this.state = { status: BatchStatus.AwaitingDownload };
    }
    onProcessingError(attempt) {
        this.failedProcessingAttempts.push(attempt);
        if (this.failedProcessingAttempts.length > constants_1.MAX_BATCH_PROCESSING_ATTEMPTS) {
            throw new BatchError(this.errorType({ code: BatchErrorCode.MAX_PROCESSING_ATTEMPTS }));
        }
        this.state = { status: BatchStatus.AwaitingDownload };
    }
    /** Helper to construct typed BatchError. Stack traces are correct as the error is thrown above */
    errorType(type) {
        return { ...type, ...this.getMetadata() };
    }
    wrongStatusErrorType(expectedStatus) {
        return this.errorType({ code: BatchErrorCode.WRONG_STATUS, expectedStatus });
    }
}
exports.Batch = Batch;
var BatchErrorCode;
(function (BatchErrorCode) {
    BatchErrorCode["WRONG_STATUS"] = "BATCH_ERROR_WRONG_STATUS";
    BatchErrorCode["MAX_DOWNLOAD_ATTEMPTS"] = "BATCH_ERROR_MAX_DOWNLOAD_ATTEMPTS";
    BatchErrorCode["MAX_PROCESSING_ATTEMPTS"] = "BATCH_ERROR_MAX_PROCESSING_ATTEMPTS";
    BatchErrorCode["MAX_EXECUTION_ENGINE_ERROR_ATTEMPTS"] = "MAX_EXECUTION_ENGINE_ERROR_ATTEMPTS";
})(BatchErrorCode = exports.BatchErrorCode || (exports.BatchErrorCode = {}));
class BatchError extends lodestar_utils_1.LodestarError {
}
exports.BatchError = BatchError;
//# sourceMappingURL=batch.js.map