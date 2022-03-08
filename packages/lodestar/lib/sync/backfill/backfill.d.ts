/// <reference types="node" />
import { IMetrics } from "../../metrics/metrics";
import { EventEmitter } from "events";
import { StrictEventEmitter } from "strict-event-emitter-types";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { phase0, Root, Slot, allForks } from "@chainsafe/lodestar-types";
import { ILogger } from "@chainsafe/lodestar-utils";
import { AbortSignal } from "@chainsafe/abort-controller";
import { IBeaconChain } from "../../chain";
import { IBeaconDb } from "../../db";
import { INetwork } from "../../network";
import { BackfillBlockHeader, BackfillBlock } from "./verify";
import { TreeBacked } from "@chainsafe/ssz";
export declare type BackfillSyncModules = {
    chain: IBeaconChain;
    db: IBeaconDb;
    network: INetwork;
    config: IBeaconConfig;
    logger: ILogger;
    metrics: IMetrics | null;
    anchorState: TreeBacked<allForks.BeaconState>;
    wsCheckpoint?: phase0.Checkpoint;
    signal: AbortSignal;
};
declare type BackfillModules = BackfillSyncModules & {
    syncAnchor: BackFillSyncAnchor;
    backfillStartFromSlot: Slot;
    prevFinalizedCheckpointBlock: BackfillBlockHeader;
    wsCheckpointHeader: BackfillBlockHeader | null;
    backfillRangeWrittenSlot: Slot | null;
};
export declare type BackfillSyncOpts = {
    backfillBatchSize: number;
};
export declare enum BackfillSyncEvent {
    completed = "BackfillSync-completed"
}
export declare enum BackfillSyncMethod {
    database = "database",
    backfilled_ranges = "backfilled_ranges",
    rangesync = "rangesync",
    blockbyroot = "blockbyroot"
}
export declare enum BackfillSyncStatus {
    pending = "pending",
    syncing = "syncing",
    completed = "completed",
    aborted = "aborted"
}
declare type BackfillSyncEvents = {
    [BackfillSyncEvent.completed]: (
    /** Oldest slot synced */
    oldestSlotSynced: Slot) => void;
};
declare type BackfillSyncEmitter = StrictEventEmitter<EventEmitter, BackfillSyncEvents>;
/**
 * At any given point, we should have
 * 1. anchorBlock (with its root anchorBlockRoot at anchorSlot) for next round of sync
 *    which is the same as the lastBackSyncedBlock
 * 2. We know the anchorBlockRoot but don't have its anchorBlock and anchorSlot yet, and its
 *    parent of lastBackSyncedBlock we synced in a previous successfull round
 * 3. We just started with only anchorBlockRoot, but we know (and will validate) its anchorSlot
 */
declare type BackFillSyncAnchor = {
    anchorBlock: allForks.SignedBeaconBlock;
    anchorBlockRoot: Root;
    anchorSlot: Slot;
    lastBackSyncedBlock: BackfillBlock;
} | {
    anchorBlock: null;
    anchorBlockRoot: Root;
    anchorSlot: null;
    lastBackSyncedBlock: BackfillBlock;
} | {
    anchorBlock: null;
    anchorBlockRoot: Root;
    anchorSlot: Slot;
    lastBackSyncedBlock: null;
};
declare const BackfillSync_base: new () => BackfillSyncEmitter;
export declare class BackfillSync extends BackfillSync_base {
    /** Lowest slot that we have backfilled to */
    syncAnchor: BackFillSyncAnchor;
    private readonly chain;
    private readonly network;
    private readonly db;
    private readonly config;
    private readonly logger;
    private readonly metrics;
    /**
     * Process in blocks of at max batchSize
     */
    private opts;
    /**
     * If wsCheckpoint provided was in past then the (db) state from which beacon node started,
     * needs to be validated as per spec.
     *
     * 1. This could lie in between of the previous backfilled range, in which case it would be
     *    sufficient to check if its DB, once the linkage to that range has been verified.
     * 2. Else if it lies outside the backfilled range, the linkage to this checkpoint in
     *    backfill needs to be verified.
     */
    private wsCheckpointHeader;
    private wsValidated;
    /**
     * From https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/weak-subjectivity.md
     *
     *
     * If
     *   1. The wsCheckpoint provided was ahead of the db's finalized checkpoint or
     *   2. There were gaps in the backfill - keys to backfillRanges are always (by construction)
     *     a) Finalized Checkpoint or b) previous wsCheckpoint
     *
     * the linkage to the previous finalized/wss checkpoint(s) needs to be verfied. If there is
     * no such checkpoint remaining, the linkage to genesis needs to be validated
     *
     * Initialize with the blockArchive's last block, and on verification update to the next
     * preceding backfillRange key's checkpoint.
     */
    private prevFinalizedCheckpointBlock;
    /** Starting point that this specific backfill sync "session" started from */
    private backfillStartFromSlot;
    private backfillRangeWrittenSlot;
    private processor;
    private peers;
    private status;
    private signal;
    constructor(opts: BackfillSyncOpts, modules: BackfillModules);
    /**
     * Use the root of the anchorState of the beacon node as the starting point of the
     * backfill sync with its expected slot to be anchorState.slot, which will be
     * validated once the block is resolved in the backfill sync.
     *
     * NOTE: init here is quite light involving couple of
     *
     *   1. db keys lookup in stateArchive/backfilledRanges
     *   2. computing root(s) for anchorBlockRoot and prevFinalizedCheckpointBlock
     *
     * The way we initialize beacon node, wsCheckpoint's slot is always <= anchorSlot
     * If:
     *   the root belonging to wsCheckpoint is in the DB, we need to verify linkage to it
     *   i.e. it becomes our first prevFinalizedCheckpointBlock
     * Else
     *   we initialize prevFinalizedCheckpointBlock from the last stored db finalized state
     *   for verification and when we go below its epoch we just check if a correct block
     *   corresponding to wsCheckpoint root was stored.
     *
     * and then we continue going back and verifying the next unconnected previous finalized
     * or wsCheckpoints identifiable as the keys of backfill sync.
     */
    static init<T extends BackfillSync = BackfillSync>(opts: BackfillSyncOpts, modules: BackfillSyncModules): Promise<T>;
    /** Throw / return all AsyncGenerators */
    close(): void;
    /**
     * @returns Returns oldestSlotSynced
     */
    private sync;
    private addPeer;
    private removePeer;
    /**
     * Ensure that any weak subjectivity checkpoint provided in past with respect
     * the initialization point is the same block tree as the DB once backfill
     */
    private checkIfCheckpointSyncedAndValidate;
    private checkUpdateFromBackfillSequences;
    private fastBackfillDb;
    private syncBlockByRoot;
    private syncRange;
}
export {};
//# sourceMappingURL=backfill.d.ts.map