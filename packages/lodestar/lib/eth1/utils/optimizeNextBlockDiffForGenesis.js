"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeNextBlockDiffForGenesis = void 0;
/**
 * Utility for fetching genesis min genesis time block
 * Returns an approximation of the next block diff to fetch to progressively
 * get closer to the block that satisfies min genesis time condition
 */
function optimizeNextBlockDiffForGenesis(lastFetchedBlock, params) {
    const timeToGenesis = params.MIN_GENESIS_TIME - params.GENESIS_DELAY - lastFetchedBlock.timestamp;
    const numBlocksToGenesis = Math.floor(timeToGenesis / params.SECONDS_PER_ETH1_BLOCK);
    if (numBlocksToGenesis <= 2) {
        return 1;
    }
    else {
        return Math.max(1, Math.floor(numBlocksToGenesis / 2));
    }
}
exports.optimizeNextBlockDiffForGenesis = optimizeNextBlockDiffForGenesis;
//# sourceMappingURL=optimizeNextBlockDiffForGenesis.js.map