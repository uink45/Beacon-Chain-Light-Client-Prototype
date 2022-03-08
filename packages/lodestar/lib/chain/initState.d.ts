/**
 * @module chain
 */
import { AbortSignal } from "@chainsafe/abort-controller";
import { phase0, CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { allForks } from "@chainsafe/lodestar-types";
import { IBeaconConfig, IChainForkConfig } from "@chainsafe/lodestar-config";
import { ILogger } from "@chainsafe/lodestar-utils";
import { TreeBacked } from "@chainsafe/ssz";
import { IBeaconDb } from "../db";
import { IMetrics } from "../metrics";
import { IGenesisResult } from "./genesis/interface";
import { CheckpointStateCache, StateContextCache } from "./stateCache";
import { Eth1Options } from "../eth1/options";
export declare function persistGenesisResult(db: IBeaconDb, genesisResult: IGenesisResult, genesisBlock: allForks.SignedBeaconBlock): Promise<void>;
export declare function persistAnchorState(config: IChainForkConfig, db: IBeaconDb, anchorState: TreeBacked<allForks.BeaconState>): Promise<void>;
export declare function createGenesisBlock(config: IChainForkConfig, genesisState: allForks.BeaconState): allForks.SignedBeaconBlock;
/**
 * Initialize and persist a genesis state and related data
 */
export declare function initStateFromEth1({ config, db, logger, opts, signal, }: {
    config: IChainForkConfig;
    db: IBeaconDb;
    logger: ILogger;
    opts: Eth1Options;
    signal: AbortSignal;
}): Promise<TreeBacked<allForks.BeaconState>>;
/**
 * Restore the latest beacon state from db
 */
export declare function initStateFromDb(config: IChainForkConfig, db: IBeaconDb, logger: ILogger): Promise<TreeBacked<allForks.BeaconState>>;
/**
 * Initialize and persist an anchor state (either weak subjectivity or genesis)
 */
export declare function initStateFromAnchorState(config: IChainForkConfig, db: IBeaconDb, logger: ILogger, anchorState: TreeBacked<allForks.BeaconState>): Promise<TreeBacked<allForks.BeaconState>>;
/**
 * Restore a beacon state to the state cache.
 */
export declare function restoreStateCaches(config: IBeaconConfig, stateCache: StateContextCache, checkpointStateCache: CheckpointStateCache, state: TreeBacked<allForks.BeaconState>): CachedBeaconStateAllForks;
export declare function initBeaconMetrics(metrics: IMetrics, state: TreeBacked<allForks.BeaconState>): void;
export declare function computeAnchorCheckpoint(config: IChainForkConfig, anchorState: allForks.BeaconState): {
    checkpoint: phase0.Checkpoint;
    blockHeader: phase0.BeaconBlockHeader;
};
//# sourceMappingURL=initState.d.ts.map