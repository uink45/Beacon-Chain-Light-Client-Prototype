"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eth1DepositDataTracker = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const eth1DepositsCache_1 = require("./eth1DepositsCache");
const eth1DataCache_1 = require("./eth1DataCache");
const eth1Vote_1 = require("./utils/eth1Vote");
const deposits_1 = require("./utils/deposits");
const jsonRpcHttpClient_1 = require("./provider/jsonRpcHttpClient");
const eth1Provider_1 = require("./provider/eth1Provider");
const MAX_BLOCKS_PER_BLOCK_QUERY = 1000;
const MAX_BLOCKS_PER_LOG_QUERY = 1000;
/** Eth1 blocks happen every 14s approx, not need to update too often once synced */
const AUTO_UPDATE_PERIOD_MS = 60 * 1000;
/** Prevent infinite loops */
const MIN_UPDATE_PERIOD_MS = 1 * 1000;
/** Miliseconds to wait after getting 429 Too Many Requests */
const RATE_LIMITED_WAIT_MS = 30 * 1000;
/** Min time to wait on auto update loop on unknown error */
const MIN_WAIT_ON_ERORR_MS = 1 * 1000;
/**
 * Main class handling eth1 data fetching, processing and storing
 * Upon instantiation, starts fetcheing deposits and blocks at regular intervals
 */
class Eth1DepositDataTracker {
    constructor(opts, { config, db, logger, signal }, eth1Provider) {
        this.eth1Provider = eth1Provider;
        this.config = config;
        this.signal = signal;
        this.logger = logger;
        this.eth1Provider = eth1Provider;
        this.depositsCache = new eth1DepositsCache_1.Eth1DepositsCache(opts, config, db);
        this.eth1DataCache = new eth1DataCache_1.Eth1DataCache(config, db);
        this.lastProcessedDepositBlockNumber = null;
        if (opts.depositContractDeployBlock === undefined) {
            this.logger.warn("No depositContractDeployBlock provided");
        }
        this.runAutoUpdate().catch((e) => {
            if (!(e instanceof lodestar_utils_1.ErrorAborted)) {
                this.logger.error("Error on eth1 loop", {}, e);
            }
        });
    }
    /**
     * Return eth1Data and deposits ready for block production for a given state
     */
    async getEth1DataAndDeposits(state) {
        const eth1Data = await this.getEth1Data(state);
        const deposits = await this.getDeposits(state, eth1Data);
        return { eth1Data, deposits };
    }
    /**
     * Returns an eth1Data vote for a given state.
     * Requires internal caches to be updated regularly to return good results
     */
    async getEth1Data(state) {
        try {
            const eth1VotesToConsider = await (0, eth1Vote_1.getEth1VotesToConsider)(this.config, state, this.eth1DataCache.get.bind(this.eth1DataCache));
            return (0, eth1Vote_1.pickEth1Vote)(state, eth1VotesToConsider);
        }
        catch (e) {
            // Note: In case there's a DB issue, don't stop a block proposal. Just vote for current eth1Data
            this.logger.error("CRITICIAL: Error reading valid votes, voting for current eth1Data", {}, e);
            return state.eth1Data;
        }
    }
    /**
     * Returns deposits to be included for a given state and eth1Data vote.
     * Requires internal caches to be updated regularly to return good results
     */
    async getDeposits(state, eth1DataVote) {
        // No new deposits have to be included, continue
        if (eth1DataVote.depositCount === state.eth1DepositIndex) {
            return [];
        }
        // TODO: Review if this is optimal
        // Convert to view first to hash once and compare hashes
        const eth1DataVoteView = lodestar_types_1.ssz.phase0.Eth1Data.createTreeBackedFromStruct(eth1DataVote);
        // Eth1 data may change due to the vote included in this block
        const newEth1Data = lodestar_beacon_state_transition_1.allForks.becomesNewEth1Data(state, eth1DataVoteView) ? eth1DataVoteView : state.eth1Data;
        return await (0, deposits_1.getDeposits)(state, newEth1Data, this.depositsCache.get.bind(this.depositsCache));
    }
    /**
     * Abortable async setInterval that runs its callback once at max between `ms` at minimum
     */
    async runAutoUpdate() {
        let lastRunMs = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            lastRunMs = Date.now();
            try {
                const hasCaughtUp = await this.update();
                if (hasCaughtUp) {
                    const sleepTimeMs = Math.max(AUTO_UPDATE_PERIOD_MS + lastRunMs - Date.now(), MIN_UPDATE_PERIOD_MS);
                    await (0, lodestar_utils_1.sleep)(sleepTimeMs, this.signal);
                }
            }
            catch (e) {
                // From Infura: 429 Too Many Requests
                if (e instanceof jsonRpcHttpClient_1.HttpRpcError && e.status === 429) {
                    this.logger.debug("Eth1 provider rate limited", {}, e);
                    await (0, lodestar_utils_1.sleep)(RATE_LIMITED_WAIT_MS, this.signal);
                }
                else if (!(0, lodestar_utils_1.isErrorAborted)(e)) {
                    this.logger.error("Error updating eth1 chain cache", {}, e);
                    await (0, lodestar_utils_1.sleep)(MIN_WAIT_ON_ERORR_MS, this.signal);
                }
            }
        }
    }
    /**
     * Update the deposit and block cache, returning an error if either fail
     * @returns true if it has catched up to the remote follow block
     */
    async update() {
        const remoteHighestBlock = await this.eth1Provider.getBlockNumber();
        const remoteFollowBlock = Math.max(0, remoteHighestBlock - this.config.ETH1_FOLLOW_DISTANCE);
        const hasCaughtUpDeposits = await this.updateDepositCache(remoteFollowBlock);
        const hasCaughtUpBlocks = await this.updateBlockCache(remoteFollowBlock);
        return hasCaughtUpDeposits && hasCaughtUpBlocks;
    }
    /**
     * Fetch deposit events from remote eth1 node up to follow-distance block
     * @returns true if it has catched up to the remote follow block
     */
    async updateDepositCache(remoteFollowBlock) {
        const lastProcessedDepositBlockNumber = await this.getLastProcessedDepositBlockNumber();
        // The DB may contain deposits from a different chain making lastProcessedDepositBlockNumber > current chain tip
        // The Math.min() fixes those rare scenarios where fromBlock > toBlock
        const fromBlock = Math.min(remoteFollowBlock, this.getFromBlockToFetch(lastProcessedDepositBlockNumber));
        const toBlock = Math.min(remoteFollowBlock, fromBlock + MAX_BLOCKS_PER_LOG_QUERY - 1);
        const depositEvents = await this.eth1Provider.getDepositEvents(fromBlock, toBlock);
        this.logger.verbose("Fetched deposits", { depositCount: depositEvents.length, fromBlock, toBlock });
        await this.depositsCache.add(depositEvents);
        // Store the `toBlock` since that block may not contain
        this.lastProcessedDepositBlockNumber = toBlock;
        return toBlock >= remoteFollowBlock;
    }
    /**
     * Fetch block headers from a remote eth1 node up to follow-distance block
     *
     * depositRoot and depositCount are inferred from already fetched deposits.
     * Calling get_deposit_root() and the smart contract for a non-latest block requires an
     * archive node, something most users don't have access too.
     * @returns true if it has catched up to the remote follow block
     */
    async updateBlockCache(remoteFollowBlock) {
        const lastCachedBlock = await this.eth1DataCache.getHighestCachedBlockNumber();
        // lastProcessedDepositBlockNumber sets the upper bound of the possible block range to fetch in this update
        const lastProcessedDepositBlockNumber = await this.getLastProcessedDepositBlockNumber();
        // lowestEventBlockNumber set a lower bound of possible block range to fetch in this update
        const lowestEventBlockNumber = await this.depositsCache.getLowestDepositEventBlockNumber();
        // If lowestEventBlockNumber is null = no deposits have been fetch or found yet.
        // So there's not useful blocks to fetch until at least 1 deposit is found. So updateBlockCache() returns true
        // because is has caught up to all possible data to fetch which is none.
        if (lowestEventBlockNumber === null || lastProcessedDepositBlockNumber === null) {
            return true;
        }
        // Cap the upper limit of fromBlock with remoteFollowBlock in case deployBlock is set to a different network value
        const fromBlock = Math.min(remoteFollowBlock, 
        // Fetch from the last cached block or the lowest known deposit block number
        Math.max(this.getFromBlockToFetch(lastCachedBlock), lowestEventBlockNumber));
        const toBlock = Math.min(remoteFollowBlock, fromBlock + MAX_BLOCKS_PER_BLOCK_QUERY - 1, // Block range is inclusive
        lastProcessedDepositBlockNumber);
        const blocksRaw = await this.eth1Provider.getBlocksByNumber(fromBlock, toBlock);
        const blocks = blocksRaw.map(eth1Provider_1.parseEth1Block);
        this.logger.verbose("Fetched eth1 blocks", { blockCount: blocks.length, fromBlock, toBlock });
        const eth1Datas = await this.depositsCache.getEth1DataForBlocks(blocks, lastProcessedDepositBlockNumber);
        await this.eth1DataCache.add(eth1Datas);
        return toBlock >= remoteFollowBlock;
    }
    getFromBlockToFetch(lastCachedBlock) {
        var _a;
        if (lastCachedBlock === null) {
            return (_a = this.eth1Provider.deployBlock) !== null && _a !== void 0 ? _a : 0;
        }
        else {
            return lastCachedBlock + 1;
        }
    }
    async getLastProcessedDepositBlockNumber() {
        if (this.lastProcessedDepositBlockNumber === null) {
            this.lastProcessedDepositBlockNumber = await this.depositsCache.getHighestDepositEventBlockNumber();
        }
        return this.lastProcessedDepositBlockNumber;
    }
}
exports.Eth1DepositDataTracker = Eth1DepositDataTracker;
//# sourceMappingURL=eth1DepositDataTracker.js.map