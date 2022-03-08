import { AbortSignal } from "@chainsafe/abort-controller";
import { IChainConfig } from "@chainsafe/lodestar-config";
import { Epoch } from "@chainsafe/lodestar-types";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IEth1Provider, EthJsonRpcBlockRaw, PowMergeBlock } from "./interface";
export declare enum StatusCode {
    PRE_MERGE = "PRE_MERGE",
    SEARCHING = "SEARCHING",
    FOUND = "FOUND",
    POST_MERGE = "POST_MERGE"
}
export declare type Eth1MergeBlockTrackerModules = {
    config: IChainConfig;
    logger: ILogger;
    signal: AbortSignal;
    clockEpoch: Epoch;
    isMergeTransitionComplete: boolean;
};
/**
 * Follows the eth1 chain to find a (or multiple?) merge blocks that cross the threshold of total terminal difficulty
 */
export declare class Eth1MergeBlockTracker {
    private readonly eth1Provider;
    private readonly config;
    private readonly logger;
    private readonly signal;
    /**
     * First found mergeBlock.
     * TODO: Accept multiple, but then handle long backwards searches properly after crossing TTD
     */
    private mergeBlock;
    private readonly blocksByHashCache;
    private status;
    private readonly intervals;
    constructor({ config, logger, signal, clockEpoch, isMergeTransitionComplete }: Eth1MergeBlockTrackerModules, eth1Provider: IEth1Provider);
    /**
     * Returns the most recent POW block that satisfies the merge block condition
     */
    getTerminalPowBlock(): PowMergeBlock | null;
    /**
     * Call when merge is irrevocably completed to stop polling unnecessary data from the eth1 node
     */
    mergeCompleted(): void;
    /**
     * Get a POW block by hash checking the local cache first
     */
    getPowBlock(powBlockHash: string): Promise<PowMergeBlock | null>;
    private close;
    private setTerminalPowBlock;
    private startFinding;
    private fetchPreviousBlocks;
    /**
     * Fetches the current latest block according the execution client.
     * If the latest block has totalDifficulty over TTD, it will backwards recursive search the merge block.
     * TODO: How to prevent doing long recursive search after the merge block has happened?
     */
    private pollLatestBlock;
    /**
     * Potential merge block, do a backwards search with parent hashes.
     * De-duplicates code between pollLatestBlock() and fetchPreviousBlocks().
     */
    private fetchPotentialMergeBlock;
    /**
     * Prune blocks to have at max MAX_CACHE_POW_HEIGHT_DISTANCE between the highest block number in the cache
     * and the lowest block number in the cache.
     *
     * Call every once in a while, i.e. once per epoch
     */
    private prune;
}
export declare function toPowBlock(block: EthJsonRpcBlockRaw): PowMergeBlock;
//# sourceMappingURL=eth1MergeBlockTracker.d.ts.map