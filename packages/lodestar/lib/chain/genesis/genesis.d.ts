/**
 * @module chain/genesis
 */
import { TreeBacked, List } from "@chainsafe/ssz";
import { Root, allForks } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { AbortSignal } from "@chainsafe/abort-controller";
import { CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IEth1Provider } from "../../eth1";
import { IGenesisBuilder, IGenesisResult } from "./interface";
export interface IGenesisBuilderKwargs {
    config: IChainForkConfig;
    eth1Provider: IEth1Provider;
    logger: ILogger;
    /** Use to restore pending progress */
    pendingStatus?: {
        state: TreeBacked<allForks.BeaconState>;
        depositTree: TreeBacked<List<Root>>;
        lastProcessedBlockNumber: number;
    };
    signal?: AbortSignal;
    maxBlocksPerPoll?: number;
}
export declare class GenesisBuilder implements IGenesisBuilder {
    state: CachedBeaconStateAllForks;
    depositTree: TreeBacked<List<Root>>;
    /** Is null if no block has been processed yet */
    lastProcessedBlockNumber: number | null;
    private readonly config;
    private readonly eth1Provider;
    private readonly logger;
    private readonly signal?;
    private readonly eth1Params;
    private readonly depositCache;
    private readonly fromBlock;
    private readonly logEvery;
    private lastLog;
    constructor({ config, eth1Provider, logger, signal, pendingStatus, maxBlocksPerPoll }: IGenesisBuilderKwargs);
    /**
     * Get eth1 deposit events and blocks and apply to this.state until we found genesis.
     */
    waitForGenesis(): Promise<IGenesisResult>;
    /**
     * First phase of waiting for genesis.
     * Stream deposits events in batches as big as possible without querying block data
     * @returns Block number at which there are enough active validators is state for genesis
     */
    private waitForGenesisValidators;
    private applyDeposits;
    /** Throttle genesis generation status log to prevent spamming */
    private throttledLog;
}
//# sourceMappingURL=genesis.d.ts.map