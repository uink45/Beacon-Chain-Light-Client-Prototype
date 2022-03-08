import { Epoch } from "@chainsafe/lodestar-types";
import { Batch, BatchOpts } from "../batch";
/**
 * Validates that the status and ordering of batches is valid
 * ```
 * [AwaitingValidation]* [Processing]? [AwaitingDownload,Downloading,AwaitingProcessing]*
 * ```
 */
export declare function validateBatchesStatus(batches: Batch[]): void;
/**
 * Return the next batch to process if any.
 * @see validateBatchesStatus for batches state description
 */
export declare function getNextBatchToProcess(batches: Batch[]): Batch | null;
/**
 * Compute the startEpoch of the next batch to be processed
 */
export declare function toBeProcessedStartEpoch(batches: Batch[], startEpoch: Epoch, opts: BatchOpts): Epoch;
/**
 * Compute the startEpoch of the next batch to be downloaded
 */
export declare function toBeDownloadedStartEpoch(batches: Batch[], startEpoch: Epoch, opts: BatchOpts): Epoch;
export declare function toArr<K, V>(map: Map<K, V>): V[];
//# sourceMappingURL=batches.d.ts.map