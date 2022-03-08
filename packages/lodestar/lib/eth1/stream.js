"use strict";
/**
 * @module eth1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepositsAndBlockStreamForGenesis = exports.getDepositsStream = void 0;
const groupDepositEventsByBlock_1 = require("./utils/groupDepositEventsByBlock");
const optimizeNextBlockDiffForGenesis_1 = require("./utils/optimizeNextBlockDiffForGenesis");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const eth1Provider_1 = require("./provider/eth1Provider");
/**
 * Phase 1 of genesis building.
 * Not enough validators, only stream deposits
 * @param signal Abort stream returning after a while loop cycle. Aborts internal sleep
 */
async function* getDepositsStream(fromBlock, provider, params, signal) {
    fromBlock = Math.max(fromBlock, provider.deployBlock);
    while (true) {
        const remoteFollowBlock = await getRemoteFollowBlock(provider, params);
        const toBlock = Math.min(remoteFollowBlock, fromBlock + params.maxBlocksPerPoll);
        const logs = await provider.getDepositEvents(fromBlock, toBlock);
        for (const batchedDeposits of (0, groupDepositEventsByBlock_1.groupDepositEventsByBlock)(logs)) {
            yield batchedDeposits;
        }
        fromBlock = toBlock;
        // If reached head, sleep for an eth1 block. Throws if signal is aborted
        await (0, lodestar_utils_1.sleep)(toBlock >= remoteFollowBlock ? params.SECONDS_PER_ETH1_BLOCK * 1000 : 10, signal);
    }
}
exports.getDepositsStream = getDepositsStream;
/**
 * Phase 2 of genesis building.
 * There are enough validators, stream deposits and blocks
 * @param signal Abort stream returning after a while loop cycle. Aborts internal sleep
 */
async function* getDepositsAndBlockStreamForGenesis(fromBlock, provider, params, signal) {
    fromBlock = Math.max(fromBlock, provider.deployBlock);
    fromBlock = Math.min(fromBlock, await getRemoteFollowBlock(provider, params));
    let toBlock = fromBlock; // First, fetch only the first block
    while (true) {
        const [logs, blockRaw] = await Promise.all([
            provider.getDepositEvents(fromBlock, toBlock),
            provider.getBlockByNumber(toBlock),
        ]);
        if (!blockRaw)
            throw Error(`No block found for number ${toBlock}`);
        const block = (0, eth1Provider_1.parseEth1Block)(blockRaw);
        yield [logs, block];
        const remoteFollowBlock = await getRemoteFollowBlock(provider, params);
        const nextBlockDiff = (0, optimizeNextBlockDiffForGenesis_1.optimizeNextBlockDiffForGenesis)(block, params);
        fromBlock = toBlock;
        toBlock = Math.min(remoteFollowBlock, fromBlock + Math.min(nextBlockDiff, params.maxBlocksPerPoll));
        // If reached head, sleep for an eth1 block. Throws if signal is aborted
        await (0, lodestar_utils_1.sleep)(toBlock >= remoteFollowBlock ? params.SECONDS_PER_ETH1_BLOCK * 1000 : 10, signal);
    }
}
exports.getDepositsAndBlockStreamForGenesis = getDepositsAndBlockStreamForGenesis;
async function getRemoteFollowBlock(provider, params) {
    const remoteHighestBlock = await provider.getBlockNumber();
    return Math.max(remoteHighestBlock - params.ETH1_FOLLOW_DISTANCE, 0);
}
//# sourceMappingURL=stream.js.map