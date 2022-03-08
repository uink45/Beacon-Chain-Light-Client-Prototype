/**
 * @module chain
 */
import { CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { IForkChoice } from "@chainsafe/lodestar-fork-choice";
import { allForks, Number64, Root, phase0, Slot, RootHex } from "@chainsafe/lodestar-types";
import { ILogger } from "@chainsafe/lodestar-utils";
import { TreeBacked } from "@chainsafe/ssz";
import { IBeaconDb } from "../db";
import { CheckpointStateCache, StateContextCache } from "./stateCache";
import { IMetrics } from "../metrics";
import { BlockProcessor, PartiallyVerifiedBlockFlags } from "./blocks";
import { IBeaconClock } from "./clock";
import { ChainEventEmitter } from "./emitter";
import { IBeaconChain, SSZObjectType } from "./interface";
import { IChainOptions } from "./options";
import { IStateRegenerator } from "./regen";
import { IBlsVerifier } from "./bls";
import { SeenAttesters, SeenAggregators, SeenBlockProposers, SeenSyncCommitteeMessages, SeenContributionAndProof } from "./seenCache";
import { AggregatedAttestationPool, AttestationPool, SyncCommitteeMessagePool, SyncContributionAndProofPool, OpPool } from "./opPools";
import { LightClientServer } from "./lightClient";
import { IEth1ForBlockProduction } from "../eth1";
import { IExecutionEngine } from "../executionEngine";
import { ReprocessController } from "./reprocess";
export declare class BeaconChain implements IBeaconChain {
    readonly genesisTime: Number64;
    readonly genesisValidatorsRoot: Root;
    readonly eth1: IEth1ForBlockProduction;
    readonly executionEngine: IExecutionEngine;
    readonly config: IBeaconConfig;
    readonly anchorStateLatestBlockSlot: Slot;
    bls: IBlsVerifier;
    forkChoice: IForkChoice;
    clock: IBeaconClock;
    emitter: ChainEventEmitter;
    stateCache: StateContextCache;
    checkpointStateCache: CheckpointStateCache;
    regen: IStateRegenerator;
    readonly lightClientServer: LightClientServer;
    readonly reprocessController: ReprocessController;
    readonly attestationPool: AttestationPool;
    readonly aggregatedAttestationPool: AggregatedAttestationPool;
    readonly syncCommitteeMessagePool: SyncCommitteeMessagePool;
    readonly syncContributionAndProofPool: SyncContributionAndProofPool;
    readonly opPool: OpPool;
    readonly seenAttesters: SeenAttesters;
    readonly seenAggregators: SeenAggregators;
    readonly seenBlockProposers: SeenBlockProposers;
    readonly seenSyncCommitteeMessages: SeenSyncCommitteeMessages;
    readonly seenContributionAndProof: SeenContributionAndProof;
    protected readonly blockProcessor: BlockProcessor;
    protected readonly db: IBeaconDb;
    protected readonly logger: ILogger;
    protected readonly metrics: IMetrics | null;
    protected readonly opts: IChainOptions;
    private readonly archiver;
    private abortController;
    constructor(opts: IChainOptions, { config, db, logger, metrics, anchorState, eth1, executionEngine, }: {
        config: IBeaconConfig;
        db: IBeaconDb;
        logger: ILogger;
        metrics: IMetrics | null;
        anchorState: TreeBacked<allForks.BeaconState>;
        eth1: IEth1ForBlockProduction;
        executionEngine: IExecutionEngine;
    });
    close(): void;
    /** Populate in-memory caches with persisted data. Call at least once on startup */
    loadFromDisk(): Promise<void>;
    /** Persist in-memory data to the DB. Call at least once before stopping the process */
    persistToDisk(): Promise<void>;
    getGenesisTime(): Number64;
    getHeadState(): CachedBeaconStateAllForks;
    getHeadStateAtCurrentEpoch(): Promise<CachedBeaconStateAllForks>;
    getCanonicalBlockAtSlot(slot: Slot): Promise<allForks.SignedBeaconBlock | null>;
    processBlock(block: allForks.SignedBeaconBlock, flags?: PartiallyVerifiedBlockFlags): Promise<void>;
    processChainSegment(blocks: allForks.SignedBeaconBlock[], flags?: PartiallyVerifiedBlockFlags): Promise<void>;
    getStatus(): phase0.Status;
    /**
     * Returns Promise that resolves either on block found or once 1 slot passes.
     * Used to handle unknown block root for both unaggregated and aggregated attestations.
     * @returns true if blockFound
     */
    waitForBlockOfAttestation(slot: Slot, root: RootHex): Promise<boolean>;
    persistInvalidSszObject(type: SSZObjectType, bytes: Uint8Array, suffix?: string): string | null;
}
//# sourceMappingURL=chain.d.ts.map