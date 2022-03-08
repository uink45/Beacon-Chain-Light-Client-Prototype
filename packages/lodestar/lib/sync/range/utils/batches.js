"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toArr = exports.toBeDownloadedStartEpoch = exports.toBeProcessedStartEpoch = exports.getNextBatchToProcess = exports.validateBatchesStatus = void 0;
const batch_1 = require("../batch");
/**
 * Validates that the status and ordering of batches is valid
 * ```
 * [AwaitingValidation]* [Processing]? [AwaitingDownload,Downloading,AwaitingProcessing]*
 * ```
 */
function validateBatchesStatus(batches) {
    let processing = 0;
    let preProcessing = 0;
    for (const batch of batches) {
        const status = batch.state.status;
        switch (status) {
            case batch_1.BatchStatus.AwaitingValidation:
                if (processing > 0)
                    throw Error("AwaitingValidation state found after Processing");
                if (preProcessing > 0)
                    throw Error("AwaitingValidation state found after PreProcessing");
                break;
            case batch_1.BatchStatus.Processing:
                if (preProcessing > 0)
                    throw Error("Processing state found after PreProcessing");
                if (processing > 0)
                    throw Error("More than one Processing state found");
                processing++;
                break;
            case batch_1.BatchStatus.AwaitingDownload:
            case batch_1.BatchStatus.Downloading:
            case batch_1.BatchStatus.AwaitingProcessing:
                preProcessing++;
                break;
            default:
                throw Error(`Unknown status: ${status}`);
        }
    }
}
exports.validateBatchesStatus = validateBatchesStatus;
/**
 * Return the next batch to process if any.
 * @see validateBatchesStatus for batches state description
 */
function getNextBatchToProcess(batches) {
    for (const batch of batches) {
        switch (batch.state.status) {
            // If an AwaitingProcessing batch exists it can only be preceeded by AwaitingValidation
            case batch_1.BatchStatus.AwaitingValidation:
                break;
            case batch_1.BatchStatus.AwaitingProcessing:
                return batch;
            // There MUST be no AwaitingProcessing state after AwaitingDownload, Downloading, Processing
            case batch_1.BatchStatus.AwaitingDownload:
            case batch_1.BatchStatus.Downloading:
            case batch_1.BatchStatus.Processing:
                return null;
        }
    }
    // Exhausted batches
    return null;
}
exports.getNextBatchToProcess = getNextBatchToProcess;
/**
 * Compute the startEpoch of the next batch to be processed
 */
function toBeProcessedStartEpoch(batches, startEpoch, opts) {
    const lastAwaitingValidation = batches
        .reverse()
        .find((batch) => batch.state.status === batch_1.BatchStatus.AwaitingValidation);
    return lastAwaitingValidation ? lastAwaitingValidation.startEpoch + opts.epochsPerBatch : startEpoch;
}
exports.toBeProcessedStartEpoch = toBeProcessedStartEpoch;
/**
 * Compute the startEpoch of the next batch to be downloaded
 */
function toBeDownloadedStartEpoch(batches, startEpoch, opts) {
    const lastBatch = batches[batches.length - 1];
    return lastBatch ? lastBatch.startEpoch + opts.epochsPerBatch : startEpoch;
}
exports.toBeDownloadedStartEpoch = toBeDownloadedStartEpoch;
function toArr(map) {
    return Array.from(map.values());
}
exports.toArr = toArr;
//# sourceMappingURL=batches.js.map