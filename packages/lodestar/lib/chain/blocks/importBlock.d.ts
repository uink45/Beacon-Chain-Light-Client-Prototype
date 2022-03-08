import { IForkChoice } from "@chainsafe/lodestar-fork-choice";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { IMetrics } from "../../metrics";
import { IEth1ForBlockProduction } from "../../eth1";
import { IExecutionEngine } from "../../executionEngine";
import { IBeaconDb } from "../../db";
import { CheckpointStateCache, StateContextCache } from "../stateCache";
import { ChainEventEmitter } from "../emitter";
import { LightClientServer } from "../lightClient";
import { FullyVerifiedBlock } from "./types";
export declare type ImportBlockModules = {
    db: IBeaconDb;
    eth1: IEth1ForBlockProduction;
    forkChoice: IForkChoice;
    stateCache: StateContextCache;
    checkpointStateCache: CheckpointStateCache;
    lightClientServer: LightClientServer;
    executionEngine: IExecutionEngine;
    emitter: ChainEventEmitter;
    config: IChainForkConfig;
    logger: ILogger;
    metrics: IMetrics | null;
};
/**
 * Imports a fully verified block into the chain state. Produces multiple permanent side-effects.
 *
 * Import block:
 * - Observe attestations
 * - Add validators to the pubkey cache
 * - Load shuffling caches
 * - Do weak subjectivy check
 * - Register block with fork-hoice
 * - Register state and block to the validator monitor
 * - For each attestation
 *   - Get indexed attestation
 *   - Register attestation with fork-choice
 *   - Register attestation with validator monitor (only after sync)
 * - Write block and state to hot db
 * - Write block and state to snapshot_cache
 * - head_tracker.register_block(block_root, parent_root, slot)
 * - Send events after everything is done
 */
export declare function importBlock(chain: ImportBlockModules, fullyVerifiedBlock: FullyVerifiedBlock): Promise<void>;
//# sourceMappingURL=importBlock.d.ts.map