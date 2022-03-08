"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processChainSegment = exports.processBlock = exports.BlockProcessor = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const emitter_1 = require("../emitter");
const queue_1 = require("../../util/queue");
const errors_1 = require("../errors");
const verifyBlock_1 = require("./verifyBlock");
const importBlock_1 = require("./importBlock");
const chainSegment_1 = require("./utils/chainSegment");
const QUEUE_MAX_LENGHT = 256;
/**
 * BlockProcessor processes block jobs in a queued fashion, one after the other.
 */
class BlockProcessor {
    constructor(modules, opts, signal) {
        this.jobQueue = new queue_1.JobItemQueue((job) => {
            if (!Array.isArray(job)) {
                return processBlock(modules, job, opts);
            }
            else {
                return processChainSegment(modules, job, opts);
            }
        }, { maxLength: QUEUE_MAX_LENGHT, signal }, modules.metrics ? modules.metrics.blockProcessorQueue : undefined);
    }
    async processBlockJob(job) {
        await this.jobQueue.push(job);
    }
    async processChainSegment(job) {
        await this.jobQueue.push(job);
    }
}
exports.BlockProcessor = BlockProcessor;
/**
 * Validate and process a block
 *
 * The only effects of running this are:
 * - forkChoice update, in the case of a valid block
 * - various events emitted: checkpoint, forkChoice:*, head, block, error:block
 * - (state cache update, from state regeneration)
 *
 * All other effects are provided by downstream event handlers
 */
async function processBlock(modules, partiallyVerifiedBlock, opts) {
    try {
        const fullyVerifiedBlock = await (0, verifyBlock_1.verifyBlock)(modules, partiallyVerifiedBlock, opts);
        await (0, importBlock_1.importBlock)(modules, fullyVerifiedBlock);
    }
    catch (e) {
        // above functions should only throw BlockError
        const err = getBlockError(e, partiallyVerifiedBlock.block);
        if (partiallyVerifiedBlock.ignoreIfKnown &&
            (err.type.code === errors_1.BlockErrorCode.ALREADY_KNOWN || err.type.code === errors_1.BlockErrorCode.GENESIS_BLOCK)) {
            // Flag ignoreIfKnown causes BlockErrorCodes ALREADY_KNOWN, GENESIS_BLOCK to resolve.
            // Return before emitting to not cause loud logging.
            return;
        }
        modules.emitter.emit(emitter_1.ChainEvent.errorBlock, err);
        throw err;
    }
}
exports.processBlock = processBlock;
/**
 * Similar to processBlockJob but this process a chain segment
 */
async function processChainSegment(modules, partiallyVerifiedBlocks, opts) {
    const blocks = partiallyVerifiedBlocks.map((b) => b.block);
    (0, chainSegment_1.assertLinearChainSegment)(modules.config, blocks);
    let importedBlocks = 0;
    for (const partiallyVerifiedBlock of partiallyVerifiedBlocks) {
        try {
            // TODO: Re-use preState
            const fullyVerifiedBlock = await (0, verifyBlock_1.verifyBlock)(modules, partiallyVerifiedBlock, opts);
            await (0, importBlock_1.importBlock)(modules, fullyVerifiedBlock);
            importedBlocks++;
            // this avoids keeping our node busy processing blocks
            await (0, lodestar_utils_1.sleep)(0);
        }
        catch (e) {
            // above functions should only throw BlockError
            const err = getBlockError(e, partiallyVerifiedBlock.block);
            if (partiallyVerifiedBlock.ignoreIfKnown &&
                (err.type.code === errors_1.BlockErrorCode.ALREADY_KNOWN || err.type.code === errors_1.BlockErrorCode.GENESIS_BLOCK)) {
                continue;
            }
            if (partiallyVerifiedBlock.ignoreIfFinalized && err.type.code == errors_1.BlockErrorCode.WOULD_REVERT_FINALIZED_SLOT) {
                continue;
            }
            modules.emitter.emit(emitter_1.ChainEvent.errorBlock, err);
            // Convert to ChainSegmentError to append `importedBlocks` data
            const chainSegmentError = new errors_1.ChainSegmentError(partiallyVerifiedBlock.block, err.type, importedBlocks);
            chainSegmentError.stack = err.stack;
            throw chainSegmentError;
        }
    }
}
exports.processChainSegment = processChainSegment;
function getBlockError(e, block) {
    if (e instanceof errors_1.BlockError) {
        return e;
    }
    else if (e instanceof Error) {
        const blockError = new errors_1.BlockError(block, { code: errors_1.BlockErrorCode.BEACON_CHAIN_ERROR, error: e });
        blockError.stack = e.stack;
        return blockError;
    }
    else {
        return new errors_1.BlockError(block, { code: errors_1.BlockErrorCode.BEACON_CHAIN_ERROR, error: e });
    }
}
//# sourceMappingURL=index.js.map