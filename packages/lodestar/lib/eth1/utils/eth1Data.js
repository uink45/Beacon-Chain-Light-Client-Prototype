"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepositRootByDepositCount = exports.getDepositsByBlockNumber = exports.getEth1DataForBlocks = void 0;
const tree_1 = require("../../util/tree");
const binarySearch_1 = require("../../util/binarySearch");
const errors_1 = require("../errors");
/**
 * Appends partial eth1 data (depositRoot, depositCount) in a sequence of blocks
 * eth1 data deposit is inferred from sparse eth1 data obtained from the deposit logs
 */
async function getEth1DataForBlocks(blocks, depositDescendingStream, depositRootTree, lastProcessedDepositBlockNumber) {
    // Exclude blocks for which there is no valid eth1 data deposit
    if (lastProcessedDepositBlockNumber !== null) {
        blocks = blocks.filter((block) => block.blockNumber <= lastProcessedDepositBlockNumber);
    }
    // A valid block can be constructed using previous `state.eth1Data`, don't throw
    if (blocks.length === 0) {
        return [];
    }
    // Collect the latest deposit of each blockNumber in a block number range
    const fromBlock = blocks[0].blockNumber;
    const toBlock = blocks[blocks.length - 1].blockNumber;
    const depositsByBlockNumber = await getDepositsByBlockNumber(fromBlock, toBlock, depositDescendingStream);
    if (depositsByBlockNumber.length === 0) {
        throw new errors_1.Eth1Error({ code: errors_1.Eth1ErrorCode.NO_DEPOSITS_FOR_BLOCK_RANGE, fromBlock, toBlock });
    }
    // Precompute a map of depositCount => depositRoot (from depositRootTree)
    const depositCounts = depositsByBlockNumber.map((event) => event.index + 1);
    const depositRootByDepositCount = getDepositRootByDepositCount(depositCounts, depositRootTree);
    const eth1Datas = [];
    for (const block of blocks) {
        const deposit = (0, binarySearch_1.binarySearchLte)(depositsByBlockNumber, block.blockNumber, (event) => event.blockNumber);
        const depositCount = deposit.index + 1;
        const depositRoot = depositRootByDepositCount.get(depositCount);
        if (depositRoot === undefined) {
            throw new errors_1.Eth1Error({ code: errors_1.Eth1ErrorCode.NO_DEPOSIT_ROOT, depositCount });
        }
        eth1Datas.push({ ...block, depositCount, depositRoot });
    }
    return eth1Datas;
}
exports.getEth1DataForBlocks = getEth1DataForBlocks;
/**
 * Collect depositCount by blockNumber from a stream matching a block number range
 * For a given blockNumber it's depositCount is equal to the index + 1 of the
 * closest deposit event whose deposit.blockNumber <= blockNumber
 * @returns array ascending by blockNumber
 */
async function getDepositsByBlockNumber(fromBlock, toBlock, depositEventDescendingStream) {
    const depositCountMap = new Map();
    // Take blocks until the block under the range lower bound (included)
    for await (const deposit of depositEventDescendingStream) {
        if (deposit.blockNumber <= toBlock && !depositCountMap.has(deposit.blockNumber)) {
            depositCountMap.set(deposit.blockNumber, deposit);
        }
        if (deposit.blockNumber < fromBlock) {
            break;
        }
    }
    return Array.from(depositCountMap.values()).sort((a, b) => a.blockNumber - b.blockNumber);
}
exports.getDepositsByBlockNumber = getDepositsByBlockNumber;
/**
 * Precompute a map of depositCount => depositRoot from a depositRootTree filled beforehand
 */
function getDepositRootByDepositCount(depositCounts, depositRootTree) {
    // Unique + sort numerically in descending order
    depositCounts = [...new Set(depositCounts)].sort((a, b) => b - a);
    if (depositCounts.length > 0) {
        const maxIndex = depositCounts[0] - 1;
        const treeLength = depositRootTree.length - 1;
        if (maxIndex > treeLength) {
            throw new errors_1.Eth1Error({ code: errors_1.Eth1ErrorCode.NOT_ENOUGH_DEPOSIT_ROOTS, index: maxIndex, treeLength });
        }
    }
    const depositRootByDepositCount = new Map();
    for (const depositCount of depositCounts) {
        depositRootTree = (0, tree_1.getTreeAtIndex)(depositRootTree, depositCount - 1);
        depositRootByDepositCount.set(depositCount, depositRootTree.hashTreeRoot());
    }
    return depositRootByDepositCount;
}
exports.getDepositRootByDepositCount = getDepositRootByDepositCount;
//# sourceMappingURL=eth1Data.js.map