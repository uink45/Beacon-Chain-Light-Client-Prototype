import { IChainConfig } from "@chainsafe/lodestar-config";
/**
 * Utility for fetching genesis min genesis time block
 * Returns an approximation of the next block diff to fetch to progressively
 * get closer to the block that satisfies min genesis time condition
 */
export declare function optimizeNextBlockDiffForGenesis(lastFetchedBlock: {
    timestamp: number;
}, params: Pick<IChainConfig, "MIN_GENESIS_TIME" | "GENESIS_DELAY" | "SECONDS_PER_ETH1_BLOCK">): number;
//# sourceMappingURL=optimizeNextBlockDiffForGenesis.d.ts.map