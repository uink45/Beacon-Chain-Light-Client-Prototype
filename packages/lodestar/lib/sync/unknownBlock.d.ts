import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { ILogger } from "@chainsafe/lodestar-utils";
import { INetwork } from "../network";
import { IBeaconChain } from "../chain";
import { IMetrics } from "../metrics";
import { SyncOptions } from "./options";
export declare class UnknownBlockSync {
    private readonly config;
    private readonly network;
    private readonly chain;
    private readonly logger;
    private readonly metrics;
    /**
     * block RootHex -> PendingBlock. To avoid finding same root at the same time
     */
    private readonly pendingBlocks;
    private readonly knownBadBlocks;
    constructor(config: IChainForkConfig, network: INetwork, chain: IBeaconChain, logger: ILogger, metrics: IMetrics | null, opts?: SyncOptions);
    close(): void;
    /**
     * Process an unknownBlockParent event and register the block in `pendingBlocks` Map.
     */
    private onUnknownBlock;
    private addToPendingBlocks;
    /**
     * Gather tip parent blocks with unknown parent and do a search for all of them
     */
    private triggerUnknownBlockSearch;
    private downloadParentBlock;
    /**
     * Send block to the processor awaiting completition. If processed successfully, send all children to the processor.
     * On error, remove and downscore all descendants.
     */
    private processBlock;
    /**
     * Fetches the parent of a block by root from a set of shuffled peers.
     * Will attempt a max of `MAX_ATTEMPTS_PER_BLOCK` on different peers if connectPeers.length > MAX_ATTEMPTS_PER_BLOCK.
     * Also verifies the received block root + returns the peer that provided the block for future downscoring.
     */
    private fetchUnknownBlockRoot;
    /**
     * Gets all descendant blocks of `block` recursively from `pendingBlocks`.
     * Assumes that if a parent block does not exist or is not processable, all descendant blocks are bad too.
     * Downscore all peers that have referenced any of this bad blocks. May report peers multiple times if they have
     * referenced more than one bad block.
     */
    private removeAndDownscoreAllDescendants;
    private removeAllDescendants;
}
//# sourceMappingURL=unknownBlock.d.ts.map