import { altair, phase0, RootHex, Slot, SyncPeriod } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { CachedBeaconStateAltair } from "@chainsafe/lodestar-beacon-state-transition";
import { ILogger } from "@chainsafe/lodestar-utils";
import { routes } from "@chainsafe/lodestar-api";
import { BitVector } from "@chainsafe/ssz";
import { IBeaconDb } from "../../db";
import { IMetrics } from "../../metrics";
import { ChainEventEmitter } from "../emitter";
import { PartialLightClientUpdate } from "./types";
declare type SyncAttestedData = {
    attestedHeader: phase0.BeaconBlockHeader;
    /** Precomputed root to prevent re-hashing */
    blockRoot: Uint8Array;
} & ({
    isFinalized: true;
    finalityBranch: Uint8Array[];
    finalizedCheckpoint: phase0.Checkpoint;
} | {
    isFinalized: false;
});
declare type LightClientServerModules = {
    config: IChainForkConfig;
    db: IBeaconDb;
    metrics: IMetrics | null;
    emitter: ChainEventEmitter;
    logger: ILogger;
};
/**
 * Compute and cache "init" proofs as the chain advances.
 * Will compute proofs for:
 * - All finalized blocks
 * - All non-finalized checkpoint blocks
 *
 * Params:
 * - How many epochs ago do you consider a re-org can happen? 10
 * - How many consecutive slots in a epoch you consider can be skipped? 32
 *
 * ### What data to store?
 *
 * An altair beacon state has 24 fields, with a depth of 5.
 * | field                 | gindex | index |
 * | --------------------- | ------ | ----- |
 * | finalizedCheckpoint   | 52     | 20    |
 * | currentSyncCommittee  | 54     | 22    |
 * | nextSyncCommittee     | 55     | 23    |
 *
 * Fields `currentSyncCommittee` and `nextSyncCommittee` are contiguous fields. Since they change its
 * more optimal to only store the witnesses different blocks of interest.
 *
 * ```ts
 * SyncCommitteeWitness = Container({
 *   witness: Vector[Bytes32, 4],
 *   currentSyncCommitteeRoot: Bytes32,
 *   nextSyncCommitteeRoot: Bytes32,
 * })
 * ```
 *
 * To produce finalized light-client updates, need the FinalizedCheckpointWitness + the finalized header the checkpoint
 * points too. It's cheaper to send a full BeaconBlockHeader `3*32 + 2*8` than a proof to `state_root` `(3+1)*32`.
 *
 * ```ts
 * FinalizedCheckpointWitness = Container({
 *   witness: Vector[Bytes32, 5],
 *   root: Bytes32,
 *   epoch: Epoch,
 * })
 * ```
 *
 * ### When to store data?
 *
 * Lightclient servers don't really need to support serving data for light-client at all possible roots to have a
 * functional use-case.
 * - For init proofs light-clients will probably use a finalized weak-subjectivity checkpoint
 * - For sync updates, light-clients need any update within a given period
 *
 * Fully tree-backed states are not guaranteed to be available at any time but just after processing a block. Then,
 * the server must pre-compute all data for all blocks until there's certainity of what block becomes a checkpoint
 * and which blocks doesn't.
 *
 * - SyncAggregate -> ParentBlock -> FinalizedCheckpoint -> nextSyncCommittee
 *
 * After importing a new block + postState:
 * - Persist SyncCommitteeWitness, indexed by block root of state's witness, always
 * - Persist currentSyncCommittee, indexed by hashTreeRoot, once (not necessary after the first run)
 * - Persist nextSyncCommittee, indexed by hashTreeRoot, for each period + dependantRoot
 * - Persist FinalizedCheckpointWitness only if checkpoint period = syncAggregate period
 *
 * TODO: Prune strategy:
 * - [Low value] On finalized or in finalized lookup, prune SyncCommittee that's not finalized
 * - [High value] After some time prune un-used FinalizedCheckpointWitness + finalized headers
 * - [High value] After some time prune to-be-checkpoint items that will never become checkpoints
 * - After sync period is over all pending headers are useless
 *
 * !!! BEST = finalized + highest bit count + oldest (less chance of re-org, less writes)
 *
 * Then when light-client requests the best finalized update at period N:
 * - Fetch best finalized SyncAggregateHeader in period N
 * - Fetch FinalizedCheckpointWitness at that header's block root
 * - Fetch SyncCommitteeWitness at that FinalizedCheckpointWitness.header.root
 * - Fetch SyncCommittee at that SyncCommitteeWitness.nextSyncCommitteeRoot
 *
 * When light-client request best non-finalized update at period N:
 * - Fetch best non-finalized SyncAggregateHeader in period N
 * - Fetch SyncCommitteeWitness at that SyncAggregateHeader.header.root
 * - Fetch SyncCommittee at that SyncCommitteeWitness.nextSyncCommitteeRoot
 *
 * ```
 *                       Finalized               Block   Sync
 *                       Checkpoint              Header  Aggreate
 * ----------------------|-----------------------|-------|---------> time
 *                        <---------------------   <----
 *                         finalizes               signs
 * ```
 *
 * ### What's the cost of this data?
 *
 * To estimate the data costs, let's analyze monthly. Yearly may not make sense due to weak subjectivity:
 * - 219145 slots / month
 * - 6848 epochs / month
 * - 27 sync periods / month
 *
 * The byte size of a SyncCommittee (mainnet preset) is fixed to `48 * (512 + 1) = 24624`. So with SyncCommittee only
 * the data cost to store them is `24624 * 27 = 664848` ~ 0.6 MB/m.
 *
 * Storing 4 witness per block costs `219145 * 4 * 32 = 28050560 ~ 28 MB/m`.
 * Storing 4 witness per epoch costs `6848 * 4 * 32 = 876544 ~ 0.9 MB/m`.
 */
export declare class LightClientServer {
    private readonly db;
    private readonly config;
    private readonly metrics;
    private readonly emitter;
    private readonly logger;
    private readonly knownSyncCommittee;
    private storedCurrentSyncCommittee;
    /**
     * Keep in memory since this data is very transient, not useful after a few slots
     */
    private readonly prevHeadData;
    private checkpointHeaders;
    private latestHeadUpdate;
    private readonly zero;
    constructor(modules: LightClientServerModules);
    /**
     * Call after importing a block, having the postState available in memory for proof generation.
     * - Persist state witness
     * - Use block's syncAggregate
     */
    onImportBlock(block: altair.BeaconBlock, postState: CachedBeaconStateAltair, parentBlock: {
        blockRoot: RootHex;
        slot: Slot;
    }): void;
    /**
     * API ROUTE to get `currentSyncCommittee` and `nextSyncCommittee` from a trusted state root
     */
    getSnapshot(blockRoot: Uint8Array): Promise<routes.lightclient.LightclientSnapshotWithProof>;
    /**
     * API ROUTE to get the best available update for `period` to transition to the next sync committee.
     * Criteria for best in priority order:
     * - Is finalized
     * - Has the most bits
     * - Signed header at the oldest slot
     */
    getCommitteeUpdates(period: SyncPeriod): Promise<altair.LightClientUpdate>;
    /**
     * API ROUTE to poll LightclientHeaderUpdate.
     * Clients should use the SSE type `lightclient_header_update` if available
     */
    getHeadUpdate(): Promise<routes.lightclient.LightclientHeaderUpdate>;
    /**
     * With forkchoice data compute which block roots will never become checkpoints and prune them.
     */
    pruneNonCheckpointData(nonCheckpointBlockRoots: Uint8Array[]): Promise<void>;
    private persistPostBlockImportData;
    /**
     * 1. Subscribe to gossip topics `sync_committee_{subnet_id}` and collect `sync_committee_message`
     * ```
     * slot: Slot
     * beacon_block_root: Root
     * validator_index: ValidatorIndex
     * signature: BLSSignature
     * ```
     *
     * 2. Subscribe to `sync_committee_contribution_and_proof` and collect `signed_contribution_and_proof`
     * ```
     * slot: Slot
     * beacon_block_root: Root
     * subcommittee_index: uint64
     * aggregation_bits: Bitvector[SYNC_COMMITTEE_SIZE // SYNC_COMMITTEE_SUBNET_COUNT]
     * signature: BLSSignature
     * ```
     *
     * 3. On new blocks use `block.body.sync_aggregate`, `block.parent_root` and `block.slot - 1`
     */
    private onSyncAggregate;
    /**
     * Given a new `syncAggregate` maybe persist a new best partial update if its better than the current stored for
     * that sync period.
     */
    private maybeStoreNewBestPartialUpdate;
    private storeSyncCommittee;
    /**
     * Get finalized header from db. Keeps a small in-memory cache to speed up most of the lookups
     */
    private getFinalizedHeader;
}
/**
 * Returns the update with more bits. On ties, prevUpdate is the better
 *
 * Spec v1.0.1
 * ```python
 * max(store.valid_updates, key=lambda update: sum(update.sync_committee_bits)))
 * ```
 */
export declare function isBetterUpdate(prevUpdate: PartialLightClientUpdate, nextSyncAggregate: altair.SyncAggregate, nextSyncAttestedData: SyncAttestedData): boolean;
export declare function sumBits(bits: BitVector): number;
export {};
//# sourceMappingURL=index.d.ts.map