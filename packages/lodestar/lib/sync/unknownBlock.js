"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownBlockSync = void 0;
const ssz_1 = require("@chainsafe/ssz");
const network_1 = require("../network");
const shuffle_1 = require("../util/shuffle");
const bytes_1 = require("../util/bytes");
const peer_id_1 = __importDefault(require("peer-id"));
const errors_1 = require("../chain/errors");
const wrapError_1 = require("../util/wrapError");
const map_1 = require("../util/map");
const interface_1 = require("./interface");
const pendingBlocksTree_1 = require("./utils/pendingBlocksTree");
const MAX_ATTEMPTS_PER_BLOCK = 5;
const MAX_KNOWN_BAD_BLOCKS = 500;
const MAX_PENDING_BLOCKS = 100;
class UnknownBlockSync {
    constructor(config, network, chain, logger, metrics, opts) {
        this.config = config;
        this.network = network;
        this.chain = chain;
        this.logger = logger;
        this.metrics = metrics;
        /**
         * block RootHex -> PendingBlock. To avoid finding same root at the same time
         */
        this.pendingBlocks = new Map();
        this.knownBadBlocks = new Set();
        /**
         * Process an unknownBlockParent event and register the block in `pendingBlocks` Map.
         */
        this.onUnknownBlock = (signedBlock, peerIdStr) => {
            var _a;
            try {
                this.addToPendingBlocks(signedBlock, peerIdStr);
                this.triggerUnknownBlockSearch();
                (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.syncUnknownBlock.requests.inc();
            }
            catch (e) {
                this.logger.error("Error handling unknownBlockParent event", {}, e);
            }
        };
        /**
         * Gather tip parent blocks with unknown parent and do a search for all of them
         */
        this.triggerUnknownBlockSearch = () => {
            // Cheap early stop to prevent calling the network.getConnectedPeers()
            if (this.pendingBlocks.size === 0) {
                return;
            }
            // If the node loses all peers with pending unknown blocks, the sync will stall
            const connectedPeers = this.network.getConnectedPeers();
            if (connectedPeers.length === 0) {
                return;
            }
            for (const block of (0, pendingBlocksTree_1.getLowestPendingUnknownParents)(this.pendingBlocks)) {
                this.downloadParentBlock(block, connectedPeers).catch((e) => {
                    this.logger.error("Unexpect error - downloadParentBlock", {}, e);
                });
            }
        };
        if (!(opts === null || opts === void 0 ? void 0 : opts.disableUnknownBlockSync)) {
            this.network.events.on(network_1.NetworkEvent.unknownBlockParent, this.onUnknownBlock);
            this.network.events.on(network_1.NetworkEvent.peerConnected, this.triggerUnknownBlockSearch);
        }
        if (metrics) {
            metrics.syncUnknownBlock.pendingBlocks.addCollect(() => metrics.syncUnknownBlock.pendingBlocks.set(this.pendingBlocks.size));
            metrics.syncUnknownBlock.knownBadBlocks.addCollect(() => metrics.syncUnknownBlock.knownBadBlocks.set(this.knownBadBlocks.size));
        }
    }
    close() {
        this.network.events.off(network_1.NetworkEvent.unknownBlockParent, this.onUnknownBlock);
        this.network.events.off(network_1.NetworkEvent.peerConnected, this.triggerUnknownBlockSearch);
    }
    addToPendingBlocks(signedBlock, peerIdStr) {
        const block = signedBlock.message;
        const blockRoot = this.config.getForkTypes(block.slot).BeaconBlock.hashTreeRoot(block);
        const blockRootHex = (0, ssz_1.toHexString)(blockRoot);
        const parentBlockRootHex = (0, ssz_1.toHexString)(block.parentRoot);
        let pendingBlock = this.pendingBlocks.get(blockRootHex);
        if (!pendingBlock) {
            pendingBlock = {
                blockRootHex,
                parentBlockRootHex,
                signedBlock,
                peerIdStrs: new Set(),
                status: interface_1.PendingBlockStatus.pending,
                downloadAttempts: 0,
            };
            this.pendingBlocks.set(blockRootHex, pendingBlock);
        }
        pendingBlock.peerIdStrs.add(peerIdStr);
        // Limit pending blocks to prevent DOS attacks that cause OOM
        const prunedItemCount = (0, map_1.pruneSetToMax)(this.pendingBlocks, MAX_PENDING_BLOCKS);
        if (prunedItemCount > 0) {
            this.logger.warn(`Pruned ${prunedItemCount} pending blocks from UnknownBlockSync`);
        }
        return pendingBlock;
    }
    async downloadParentBlock(block, connectedPeers) {
        var _a, _b;
        if (block.status !== interface_1.PendingBlockStatus.pending) {
            return;
        }
        block.status = interface_1.PendingBlockStatus.fetching;
        const res = await (0, wrapError_1.wrapError)(this.fetchUnknownBlockRoot((0, ssz_1.fromHexString)(block.parentBlockRootHex), connectedPeers));
        block.status = interface_1.PendingBlockStatus.pending;
        if (res.err)
            (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.syncUnknownBlock.downloadedBlocksError.inc();
        else
            (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.syncUnknownBlock.downloadedBlocksSuccess.inc();
        if (!res.err) {
            const { signedBlock, peerIdStr } = res.result;
            if (this.chain.forkChoice.hasBlock(signedBlock.message.parentRoot)) {
                // Bingo! Process block. Add to pending blocks anyway for recycle the cache that prevents duplicate processing
                this.processBlock(this.addToPendingBlocks(signedBlock, peerIdStr)).catch((e) => {
                    this.logger.error("Unexpect error - processBlock", {}, e);
                });
            }
            else {
                this.onUnknownBlock(signedBlock, peerIdStr);
            }
        }
        else {
            block.downloadAttempts++;
            const errorData = { root: block.parentBlockRootHex, attempts: block.downloadAttempts };
            if (block.downloadAttempts > MAX_ATTEMPTS_PER_BLOCK) {
                // Give up on this block and assume it does not exist, penalizing all peers as if it was a bad block
                this.logger.error("Ignoring unknown block root after many failed downloads", errorData, res.err);
                this.removeAndDownscoreAllDescendants(block);
            }
            else {
                // Try again when a new peer connects, its status changes, or a new unknownBlockParent event happens
                this.logger.debug("Error downloading unknown block root", errorData, res.err);
            }
        }
    }
    /**
     * Send block to the processor awaiting completition. If processed successfully, send all children to the processor.
     * On error, remove and downscore all descendants.
     */
    async processBlock(pendingBlock) {
        var _a, _b;
        if (pendingBlock.status === interface_1.PendingBlockStatus.processing) {
            return;
        }
        pendingBlock.status = interface_1.PendingBlockStatus.processing;
        // At gossip time, it's critical to keep a good number of mesh peers.
        // To do that, the Gossip Job Wait Time should be consistently <3s to avoid the behavior penalties in gossip
        // Gossip Job Wait Time depends on the BLS Job Wait Time
        // so `blsVerifyOnMainThread = true`: we want to verify signatures immediately without affecting the bls thread pool.
        // otherwise we can't utilize bls thread pool capacity and Gossip Job Wait Time can't be kept low consistently.
        // See https://github.com/ChainSafe/lodestar/issues/3792
        const res = await (0, wrapError_1.wrapError)(this.chain.processBlock(pendingBlock.signedBlock, { ignoreIfKnown: true, blsVerifyOnMainThread: true }));
        pendingBlock.status = interface_1.PendingBlockStatus.pending;
        if (res.err)
            (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.syncUnknownBlock.processedBlocksError.inc();
        else
            (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.syncUnknownBlock.processedBlocksSuccess.inc();
        if (!res.err) {
            this.pendingBlocks.delete(pendingBlock.blockRootHex);
            // Send child blocks to the processor
            for (const descendantBlock of (0, pendingBlocksTree_1.getDescendantBlocks)(pendingBlock.blockRootHex, this.pendingBlocks)) {
                this.processBlock(descendantBlock).catch((e) => {
                    this.logger.error("Unexpect error - processBlock", {}, e);
                });
            }
        }
        else {
            const errorData = { root: pendingBlock.blockRootHex, slot: pendingBlock.signedBlock.message.slot };
            if (res.err instanceof errors_1.BlockError) {
                switch (res.err.type.code) {
                    // This cases are already handled with `{ignoreIfKnown: true}`
                    // case BlockErrorCode.ALREADY_KNOWN:
                    // case BlockErrorCode.GENESIS_BLOCK:
                    case errors_1.BlockErrorCode.PARENT_UNKNOWN:
                    case errors_1.BlockErrorCode.PRESTATE_MISSING:
                        // Should no happen, mark as pending to try again latter
                        this.logger.error("Attempted to process block but its parent was still unknown", errorData, res.err);
                        pendingBlock.status = interface_1.PendingBlockStatus.pending;
                        break;
                    case errors_1.BlockErrorCode.EXECUTION_ENGINE_ERROR:
                        // Removing the block(s) without penalizing the peers, hoping for EL to
                        // recover on a latter download + verify attempt
                        this.removeAllDescendants(pendingBlock);
                        break;
                    default:
                        // Block is not correct with respect to our chain. Log error loudly
                        this.logger.error("Error processing block from unknown parent sync", errorData, res.err);
                        this.removeAndDownscoreAllDescendants(pendingBlock);
                }
            }
            // Probably a queue error or something unwanted happened, mark as pending to try again latter
            else {
                this.logger.error("Unknown error processing block from unknown parent sync", errorData, res.err);
                pendingBlock.status = interface_1.PendingBlockStatus.pending;
            }
        }
    }
    /**
     * Fetches the parent of a block by root from a set of shuffled peers.
     * Will attempt a max of `MAX_ATTEMPTS_PER_BLOCK` on different peers if connectPeers.length > MAX_ATTEMPTS_PER_BLOCK.
     * Also verifies the received block root + returns the peer that provided the block for future downscoring.
     */
    async fetchUnknownBlockRoot(blockRoot, connectedPeers) {
        const shuffledPeers = (0, shuffle_1.shuffle)(connectedPeers);
        const blockRootHex = (0, ssz_1.toHexString)(blockRoot);
        let lastError = null;
        for (let i = 0; i < MAX_ATTEMPTS_PER_BLOCK; i++) {
            const peer = shuffledPeers[i % shuffledPeers.length];
            try {
                const [signedBlock] = await this.network.reqResp.beaconBlocksByRoot(peer, [blockRoot]);
                // Peer does not have the block, try with next peer
                if (signedBlock === undefined) {
                    continue;
                }
                // Verify block root is correct
                const block = signedBlock.message;
                const receivedBlockRoot = this.config.getForkTypes(block.slot).BeaconBlock.hashTreeRoot(block);
                if (!(0, bytes_1.byteArrayEquals)(receivedBlockRoot, blockRoot)) {
                    throw Error(`Wrong block received by peer, expected ${(0, ssz_1.toHexString)(receivedBlockRoot)} got ${blockRootHex}`);
                }
                return { signedBlock, peerIdStr: peer.toB58String() };
            }
            catch (e) {
                this.logger.debug("Error fetching UnknownBlockRoot", { attempt: i, blockRootHex, peer: peer.toB58String() }, e);
                lastError = e;
            }
        }
        if (lastError) {
            lastError.message = `Error fetching UnknownBlockRoot after ${MAX_ATTEMPTS_PER_BLOCK} attempts: ${lastError.message}`;
            throw lastError;
        }
        else {
            throw Error(`Error fetching UnknownBlockRoot after ${MAX_ATTEMPTS_PER_BLOCK}: unknown error`);
        }
    }
    /**
     * Gets all descendant blocks of `block` recursively from `pendingBlocks`.
     * Assumes that if a parent block does not exist or is not processable, all descendant blocks are bad too.
     * Downscore all peers that have referenced any of this bad blocks. May report peers multiple times if they have
     * referenced more than one bad block.
     */
    removeAndDownscoreAllDescendants(block) {
        // Get all blocks that are a descendat of this one
        const badPendingBlocks = this.removeAllDescendants(block);
        for (const block of badPendingBlocks) {
            this.knownBadBlocks.add(block.blockRootHex);
            this.logger.error("Banning unknown parent block", {
                root: block.blockRootHex,
                slot: block.signedBlock.message.slot,
            });
            for (const peerIdStr of block.peerIdStrs) {
                // TODO: Refactor peerRpcScores to work with peerIdStr only
                const peer = peer_id_1.default.createFromB58String(peerIdStr);
                this.network.reportPeer(peer, network_1.PeerAction.LowToleranceError, "BadBlockByRoot");
            }
        }
        // Prune knownBadBlocks
        (0, map_1.pruneSetToMax)(this.knownBadBlocks, MAX_KNOWN_BAD_BLOCKS);
    }
    removeAllDescendants(block) {
        var _a;
        // Get all blocks that are a descendat of this one
        const badPendingBlocks = [block, ...(0, pendingBlocksTree_1.getAllDescendantBlocks)(block.blockRootHex, this.pendingBlocks)];
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.syncUnknownBlock.removedBlocks.inc(badPendingBlocks.length);
        for (const block of badPendingBlocks) {
            this.pendingBlocks.delete(block.blockRootHex);
            this.logger.error("Removing unknown parent block", {
                root: block.blockRootHex,
                slot: block.signedBlock.message.slot,
            });
        }
        return badPendingBlocks;
    }
}
exports.UnknownBlockSync = UnknownBlockSync;
//# sourceMappingURL=unknownBlock.js.map