"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPowBlock = exports.Eth1MergeBlockTracker = exports.StatusCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const ssz_1 = require("@chainsafe/ssz");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const utils_1 = require("./provider/utils");
const constants_1 = require("../constants");
var StatusCode;
(function (StatusCode) {
    StatusCode["PRE_MERGE"] = "PRE_MERGE";
    StatusCode["SEARCHING"] = "SEARCHING";
    StatusCode["FOUND"] = "FOUND";
    StatusCode["POST_MERGE"] = "POST_MERGE";
})(StatusCode = exports.StatusCode || (exports.StatusCode = {}));
/** Numbers of epochs in advance of merge fork condition to start looking for merge block */
const START_EPOCHS_IN_ADVANCE = 5;
/**
 * Bounds `blocksByHashCache` cache, imposing a max distance between highest and lowest block numbers.
 * In case of extreme forking the cache might grow unbounded.
 */
const MAX_CACHE_POW_HEIGHT_DISTANCE = 1024;
/** Number of blocks to request at once in a getBlocksByNumber() request */
const MAX_BLOCKS_PER_PAST_REQUEST = 1000;
/** Prevent infinite loops on error by sleeping after each error */
const SLEEP_ON_ERROR_MS = 3000;
/**
 * Follows the eth1 chain to find a (or multiple?) merge blocks that cross the threshold of total terminal difficulty
 */
class Eth1MergeBlockTracker {
    constructor({ config, logger, signal, clockEpoch, isMergeTransitionComplete }, eth1Provider) {
        this.eth1Provider = eth1Provider;
        /**
         * First found mergeBlock.
         * TODO: Accept multiple, but then handle long backwards searches properly after crossing TTD
         */
        this.mergeBlock = null;
        this.blocksByHashCache = new Map();
        this.status = StatusCode.PRE_MERGE;
        this.intervals = [];
        this.config = config;
        this.logger = logger;
        this.signal = signal;
        // If merge has already happened, disable
        if (isMergeTransitionComplete) {
            this.status = StatusCode.POST_MERGE;
            return;
        }
        // If merge is still not programed, skip
        if (config.BELLATRIX_FORK_EPOCH >= Infinity) {
            return;
        }
        const startEpoch = this.config.BELLATRIX_FORK_EPOCH - START_EPOCHS_IN_ADVANCE;
        if (startEpoch <= clockEpoch) {
            // Start now
            void this.startFinding();
        }
        else {
            // Set a timer to start in the future
            const intervalToStart = setInterval(() => {
                void this.startFinding();
            }, (startEpoch - clockEpoch) * lodestar_params_1.SLOTS_PER_EPOCH * config.SECONDS_PER_SLOT * 1000);
            this.intervals.push(intervalToStart);
        }
        signal.addEventListener("abort", () => this.close(), { once: true });
    }
    /**
     * Returns the most recent POW block that satisfies the merge block condition
     */
    getTerminalPowBlock() {
        // For better debugging in case this module stops searching too early
        if (this.mergeBlock === null && this.status === StatusCode.POST_MERGE) {
            throw Error("Eth1MergeBlockFinder is on POST_MERGE status and found no mergeBlock");
        }
        return this.mergeBlock;
    }
    /**
     * Call when merge is irrevocably completed to stop polling unnecessary data from the eth1 node
     */
    mergeCompleted() {
        this.status = StatusCode.POST_MERGE;
        this.close();
    }
    /**
     * Get a POW block by hash checking the local cache first
     */
    async getPowBlock(powBlockHash) {
        // Check cache first
        const cachedBlock = this.blocksByHashCache.get(powBlockHash);
        if (cachedBlock)
            return cachedBlock;
        // Fetch from node
        const blockRaw = await this.eth1Provider.getBlockByHash(powBlockHash);
        if (blockRaw) {
            const block = toPowBlock(blockRaw);
            this.blocksByHashCache.set(block.blockhash, block);
            return block;
        }
        return null;
    }
    close() {
        this.intervals.forEach(clearInterval);
    }
    setTerminalPowBlock(mergeBlock) {
        this.logger.info("Terminal POW block found!", {
            hash: mergeBlock.blockhash,
            number: mergeBlock.number,
            totalDifficulty: mergeBlock.totalDifficulty,
        });
        this.mergeBlock = mergeBlock;
        this.status = StatusCode.FOUND;
        this.close();
    }
    async startFinding() {
        if (this.status !== StatusCode.PRE_MERGE)
            return;
        // Terminal block hash override takes precedence over terminal total difficulty
        const terminalBlockHash = (0, ssz_1.toHexString)(this.config.TERMINAL_BLOCK_HASH);
        if (terminalBlockHash !== constants_1.ZERO_HASH_HEX) {
            try {
                const powBlockOverride = await this.getPowBlock(terminalBlockHash);
                if (powBlockOverride) {
                    this.setTerminalPowBlock(powBlockOverride);
                }
            }
            catch (e) {
                if (!(0, lodestar_utils_1.isErrorAborted)(e)) {
                    this.logger.error("Error fetching POW block from terminal block hash", { terminalBlockHash }, e);
                }
            }
            // if a TERMINAL_BLOCK_HASH other than ZERO_HASH is configured and we can't find it, return NONE
            return;
        }
        this.status = StatusCode.SEARCHING;
        this.logger.info("Starting search for terminal POW block", {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            TERMINAL_TOTAL_DIFFICULTY: this.config.TERMINAL_TOTAL_DIFFICULTY,
        });
        // 1. Fetch current head chain until finding a block with total difficulty less than `transitionStore.terminalTotalDifficulty`
        this.fetchPreviousBlocks().catch((e) => {
            if (!(0, lodestar_utils_1.isErrorAborted)(e))
                this.logger.error("Error fetching past POW blocks", {}, e);
        });
        // 2. Subscribe to eth1 blocks and recursively fetch potential POW blocks
        const intervalPoll = setInterval(() => {
            this.pollLatestBlock().catch((e) => {
                if (!(0, lodestar_utils_1.isErrorAborted)(e))
                    this.logger.error("Error fetching latest POW block", {}, e);
            });
        }, this.config.SECONDS_PER_ETH1_BLOCK * 1000);
        // 3. Prune roughly every epoch
        const intervalPrune = setInterval(() => {
            this.prune();
        }, 32 * this.config.SECONDS_PER_SLOT * 1000);
        // Register interval to clean them on close()
        this.intervals.push(intervalPoll, intervalPrune);
    }
    async fetchPreviousBlocks() {
        // If latest block is under TTD, stop. Subscriptions will pick future blocks
        // If latest block is over TTD, go backwards until finding a merge block
        // Note: Must ensure parent relationship
        // Fast path for pre-merge scenario
        const latestBlockRaw = await this.eth1Provider.getBlockByNumber("latest");
        if (!latestBlockRaw) {
            throw Error("getBlockByNumber('latest') returned null");
        }
        const latestBlock = toPowBlock(latestBlockRaw);
        // TTD not reached yet, stop looking at old blocks and expect the subscription to find merge block
        if (latestBlock.totalDifficulty < this.config.TERMINAL_TOTAL_DIFFICULTY) {
            return;
        }
        // TTD already reached, search blocks backwards
        let minFetchedBlockNumber = latestBlock.number;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const from = Math.max(0, minFetchedBlockNumber - MAX_BLOCKS_PER_PAST_REQUEST);
            // Re-fetch same block to have the full chain of parent-child nodes
            const to = minFetchedBlockNumber;
            try {
                const blocksRaw = await this.eth1Provider.getBlocksByNumber(from, to);
                const blocks = blocksRaw.map(toPowBlock);
                // Should never happen
                if (blocks.length < 2) {
                    throw Error(`getBlocksByNumber(${from}, ${to}) returned less than 2 results`);
                }
                for (let i = 0; i < blocks.length - 1; i++) {
                    const childBlock = blocks[i + 1];
                    const parentBlock = blocks[i];
                    if (childBlock.totalDifficulty >= this.config.TERMINAL_TOTAL_DIFFICULTY &&
                        parentBlock.totalDifficulty < this.config.TERMINAL_TOTAL_DIFFICULTY) {
                        // Is terminal total difficulty block
                        if (childBlock.parentHash === parentBlock.blockhash) {
                            // AND has verified block -> parent relationship
                            return this.setTerminalPowBlock(childBlock);
                        }
                        else {
                            // WARNING! Re-org while doing getBlocksByNumber() call. Ensure that this block is the merge block
                            // and not some of its parents.
                            return await this.fetchPotentialMergeBlock(childBlock);
                        }
                    }
                }
                // On next round
                minFetchedBlockNumber = Math.min(to, ...blocks.map((block) => block.number));
                // Scanned the entire blockchain
                if (minFetchedBlockNumber <= 0) {
                    return;
                }
            }
            catch (e) {
                if (!(0, lodestar_utils_1.isErrorAborted)(e))
                    this.logger.error("Error on fetchPreviousBlocks range", { from, to }, e);
                await (0, lodestar_utils_1.sleep)(SLEEP_ON_ERROR_MS, this.signal);
            }
        }
    }
    /**
     * Fetches the current latest block according the execution client.
     * If the latest block has totalDifficulty over TTD, it will backwards recursive search the merge block.
     * TODO: How to prevent doing long recursive search after the merge block has happened?
     */
    async pollLatestBlock() {
        const latestBlockRaw = await this.eth1Provider.getBlockByNumber("latest");
        if (!latestBlockRaw) {
            throw Error("getBlockByNumber('latest') returned null");
        }
        const latestBlock = toPowBlock(latestBlockRaw);
        await this.fetchPotentialMergeBlock(latestBlock);
    }
    /**
     * Potential merge block, do a backwards search with parent hashes.
     * De-duplicates code between pollLatestBlock() and fetchPreviousBlocks().
     */
    async fetchPotentialMergeBlock(block) {
        this.logger.debug("Potential terminal POW block", {
            number: block.number,
            hash: block.blockhash,
            totalDifficulty: block.totalDifficulty,
        });
        // Persist block for future searches
        this.blocksByHashCache.set(block.blockhash, block);
        // Check if this block is already visited
        while (block.totalDifficulty >= this.config.TERMINAL_TOTAL_DIFFICULTY) {
            if (block.parentHash === constants_1.ZERO_HASH_HEX) {
                // Allow genesis block to reach TTD
                // https://github.com/ethereum/consensus-specs/pull/2719
                return this.setTerminalPowBlock(block);
            }
            const parent = await this.getPowBlock(block.parentHash);
            // Unknown parent
            if (!parent) {
                return;
            }
            if (block.totalDifficulty >= this.config.TERMINAL_TOTAL_DIFFICULTY &&
                parent.totalDifficulty < this.config.TERMINAL_TOTAL_DIFFICULTY) {
                // Is terminal total difficulty block AND has verified block -> parent relationship
                return this.setTerminalPowBlock(block);
            }
            // Guard against infinite loops
            if (parent.blockhash === block.blockhash) {
                throw Error("Infinite loop: parent.blockhash === block.blockhash");
            }
            // Fetch parent's parent
            block = parent;
        }
    }
    /**
     * Prune blocks to have at max MAX_CACHE_POW_HEIGHT_DISTANCE between the highest block number in the cache
     * and the lowest block number in the cache.
     *
     * Call every once in a while, i.e. once per epoch
     */
    prune() {
        // Find the heightest block number in the cache
        let maxBlockNumber = 0;
        for (const block of this.blocksByHashCache.values()) {
            if (block.number > maxBlockNumber) {
                maxBlockNumber = block.number;
            }
        }
        // Prune blocks below the max distance
        const minHeight = maxBlockNumber - MAX_CACHE_POW_HEIGHT_DISTANCE;
        for (const [key, block] of this.blocksByHashCache.entries()) {
            if (block.number < minHeight) {
                this.blocksByHashCache.delete(key);
            }
        }
    }
}
exports.Eth1MergeBlockTracker = Eth1MergeBlockTracker;
function toPowBlock(block) {
    // Validate untrusted data from API
    return {
        number: (0, utils_1.quantityToNum)(block.number),
        blockhash: (0, utils_1.dataToRootHex)(block.hash),
        parentHash: (0, utils_1.dataToRootHex)(block.parentHash),
        totalDifficulty: (0, utils_1.quantityToBigint)(block.totalDifficulty),
    };
}
exports.toPowBlock = toPowBlock;
//# sourceMappingURL=eth1MergeBlockTracker.js.map