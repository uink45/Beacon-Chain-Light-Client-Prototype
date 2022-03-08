"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BATCH_BUFFER_SIZE = exports.EPOCHS_PER_BATCH = exports.MIN_EPOCH_TO_START_GOSSIP = exports.BATCH_SLOT_OFFSET = exports.MAX_BATCH_PROCESSING_ATTEMPTS = exports.MAX_BATCH_DOWNLOAD_ATTEMPTS = exports.MIN_FINALIZED_CHAIN_VALIDATED_EPOCHS = exports.PARALLEL_HEAD_CHAINS = void 0;
/** The number of head syncing chains to sync at a time. */
exports.PARALLEL_HEAD_CHAINS = 2;
/** Minimum work we require a finalized chain to do before picking a chain with more peers. */
exports.MIN_FINALIZED_CHAIN_VALIDATED_EPOCHS = 10;
/** The number of times to retry a batch before it is considered failed. */
exports.MAX_BATCH_DOWNLOAD_ATTEMPTS = 5;
/** Consider batch faulty after downloading and processing this number of times */
exports.MAX_BATCH_PROCESSING_ATTEMPTS = 3;
/** Batch range excludes the first block of the epoch. @see Batch */
exports.BATCH_SLOT_OFFSET = 1;
/** First epoch to allow to start gossip  */
exports.MIN_EPOCH_TO_START_GOSSIP = -1;
/**
 * Blocks are downloaded in batches from peers. This constant specifies how many epochs worth of
 * blocks per batch are requested _at most_. A batch may request less blocks to account for
 * already requested slots. There is a timeout for each batch request. If this value is too high,
 * we will negatively report peers with poor bandwidth. This can be set arbitrarily high, in which
 * case the responder will fill the response up to the max request size, assuming they have the
 * bandwidth to do so.
 */
exports.EPOCHS_PER_BATCH = 2;
/**
 * The maximum number of batches to queue before requesting more.
 * In good network conditions downloading batches is much faster than processing them
 * A number > 5 results in wasted progress when the chain completes syncing
 *
 * TODO: When switching branches usually all batches in AwaitingProcessing are dropped, could it be optimized?
 */
exports.BATCH_BUFFER_SIZE = 5;
//# sourceMappingURL=constants.js.map