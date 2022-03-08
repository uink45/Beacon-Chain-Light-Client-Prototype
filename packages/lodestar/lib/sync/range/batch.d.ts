import PeerId from "peer-id";
import { allForks, Epoch, phase0 } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { LodestarError } from "@chainsafe/lodestar-utils";
export declare type BatchOpts = {
    epochsPerBatch: Epoch;
};
/**
 * Current state of a batch
 */
export declare enum BatchStatus {
    /** The batch has failed either downloading or processing, but can be requested again. */
    AwaitingDownload = "AwaitingDownload",
    /** The batch is being downloaded. */
    Downloading = "Downloading",
    /** The batch has been completely downloaded and is ready for processing. */
    AwaitingProcessing = "AwaitingProcessing",
    /** The batch is being processed. */
    Processing = "Processing",
    /**
     * The batch was successfully processed and is waiting to be validated.
     *
     * It is not sufficient to process a batch successfully to consider it correct. This is
     * because batches could be erroneously empty, or incomplete. Therefore, a batch is considered
     * valid, only if the next sequential batch imports at least a block.
     */
    AwaitingValidation = "AwaitingValidation"
}
export declare type Attempt = {
    /** The peer that made the attempt */
    peer: PeerId;
    /** The hash of the blocks of the attempt */
    hash: Uint8Array;
};
export declare type BatchState = {
    status: BatchStatus.AwaitingDownload;
} | {
    status: BatchStatus.Downloading;
    peer: PeerId;
} | {
    status: BatchStatus.AwaitingProcessing;
    peer: PeerId;
    blocks: allForks.SignedBeaconBlock[];
} | {
    status: BatchStatus.Processing;
    attempt: Attempt;
} | {
    status: BatchStatus.AwaitingValidation;
    attempt: Attempt;
};
export declare type BatchMetadata = {
    startEpoch: Epoch;
    status: BatchStatus;
};
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
export declare class Batch {
    readonly startEpoch: Epoch;
    /** State of the batch. */
    state: BatchState;
    /** BeaconBlocksByRangeRequest */
    readonly request: phase0.BeaconBlocksByRangeRequest;
    /** The `Attempts` that have been made and failed to send us this batch. */
    readonly failedProcessingAttempts: Attempt[];
    /** The `Attempts` that have been made and failed because of execution malfunction. */
    readonly executionErrorAttempts: Attempt[];
    /** The number of download retries this batch has undergone due to a failed request. */
    private readonly failedDownloadAttempts;
    private readonly config;
    constructor(startEpoch: Epoch, config: IChainForkConfig, opts: BatchOpts);
    /**
     * Gives a list of peers from which this batch has had a failed download or processing attempt.
     */
    getFailedPeers(): PeerId[];
    getMetadata(): BatchMetadata;
    /**
     * AwaitingDownload -> Downloading
     */
    startDownloading(peer: PeerId): void;
    /**
     * Downloading -> AwaitingProcessing
     */
    downloadingSuccess(blocks: allForks.SignedBeaconBlock[]): void;
    /**
     * Downloading -> AwaitingDownload
     */
    downloadingError(): void;
    /**
     * AwaitingProcessing -> Processing
     */
    startProcessing(): allForks.SignedBeaconBlock[];
    /**
     * Processing -> AwaitingValidation
     */
    processingSuccess(): void;
    /**
     * Processing -> AwaitingDownload
     */
    processingError(err: Error): void;
    /**
     * AwaitingValidation -> AwaitingDownload
     */
    validationError(err: Error): void;
    /**
     * AwaitingValidation -> Done
     */
    validationSuccess(): Attempt;
    private onExecutionEngineError;
    private onProcessingError;
    /** Helper to construct typed BatchError. Stack traces are correct as the error is thrown above */
    private errorType;
    private wrongStatusErrorType;
}
export declare enum BatchErrorCode {
    WRONG_STATUS = "BATCH_ERROR_WRONG_STATUS",
    MAX_DOWNLOAD_ATTEMPTS = "BATCH_ERROR_MAX_DOWNLOAD_ATTEMPTS",
    MAX_PROCESSING_ATTEMPTS = "BATCH_ERROR_MAX_PROCESSING_ATTEMPTS",
    MAX_EXECUTION_ENGINE_ERROR_ATTEMPTS = "MAX_EXECUTION_ENGINE_ERROR_ATTEMPTS"
}
declare type BatchErrorType = {
    code: BatchErrorCode.WRONG_STATUS;
    expectedStatus: BatchStatus;
} | {
    code: BatchErrorCode.MAX_DOWNLOAD_ATTEMPTS;
} | {
    code: BatchErrorCode.MAX_PROCESSING_ATTEMPTS;
} | {
    code: BatchErrorCode.MAX_EXECUTION_ENGINE_ERROR_ATTEMPTS;
};
declare type BatchErrorMetadata = {
    startEpoch: number;
    status: BatchStatus;
};
export declare class BatchError extends LodestarError<BatchErrorType & BatchErrorMetadata> {
}
export {};
//# sourceMappingURL=batch.d.ts.map