import PeerId from "peer-id";
import { Epoch, Root, Slot, phase0, allForks } from "@chainsafe/lodestar-types";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { PeerAction } from "../../network";
import { RangeSyncType } from "../utils/remoteSyncType";
import { BatchErrorCode, BatchMetadata, BatchOpts } from "./batch";
export declare type SyncChainOpts = Partial<BatchOpts>;
export declare type SyncChainModules = {
    config: IChainForkConfig;
    logger: ILogger;
};
export declare type SyncChainFns = {
    /**
     * Must return if ALL blocks are processed successfully
     * If SOME blocks are processed must throw BlockProcessorError()
     */
    processChainSegment: (blocks: allForks.SignedBeaconBlock[], syncType: RangeSyncType) => Promise<void>;
    /** Must download blocks, and validate their range */
    downloadBeaconBlocksByRange: (peer: PeerId, request: phase0.BeaconBlocksByRangeRequest) => Promise<allForks.SignedBeaconBlock[]>;
    /** Report peer for negative actions. Decouples from the full network instance */
    reportPeer: (peer: PeerId, action: PeerAction, actionName: string) => void;
    /** Hook called when Chain state completes */
    onEnd: (err: Error | null, target: ChainTarget | null) => void;
};
/**
 * Sync this up to this target. Uses slot instead of epoch to re-use logic for finalized sync
 * and head sync. The root is used to uniquely identify this chain on different forks
 */
export declare type ChainTarget = {
    slot: Slot;
    root: Root;
};
export declare class SyncChainStartError extends Error {
}
export declare type SyncChainDebugState = {
    targetRoot: string | null;
    targetSlot: number | null;
    syncType: RangeSyncType;
    status: SyncChainStatus;
    startEpoch: number;
    peers: number;
    batches: BatchMetadata[];
};
export declare enum SyncChainStatus {
    Stopped = "Stopped",
    Syncing = "Syncing",
    Synced = "Synced",
    Error = "Error"
}
/**
 * Dynamic target sync chain. Peers with multiple targets but with the same syncType are added
 * through the `addPeer()` hook.
 *
 * A chain of blocks that need to be downloaded. Peers who claim to contain the target head
 * root are grouped into the peer pool and queried for batches when downloading the chain.
 */
export declare class SyncChain {
    /** Short string id to identify this SyncChain in logs */
    readonly logId: string;
    readonly syncType: RangeSyncType;
    /**
     * Should sync up until this slot, then stop.
     * Finalized SyncChains have a dynamic target, so if this chain has no peers the target can become null
     */
    target: ChainTarget;
    /** Number of validated epochs. For the SyncRange to prevent switching chains too fast */
    validatedEpochs: number;
    /** The start of the chain segment. Any epoch previous to this one has been validated. */
    private startEpoch;
    private status;
    private readonly processChainSegment;
    private readonly downloadBeaconBlocksByRange;
    private readonly reportPeer;
    /** AsyncIterable that guarantees processChainSegment is run only at once at anytime */
    private readonly batchProcessor;
    /** Sorted map of batches undergoing some kind of processing. */
    private readonly batches;
    private readonly peerset;
    private readonly logger;
    private readonly config;
    private readonly opts;
    constructor(startEpoch: Epoch, initialTarget: ChainTarget, syncType: RangeSyncType, fns: SyncChainFns, modules: SyncChainModules, opts?: SyncChainOpts);
    /**
     * Start syncing a new chain or an old one with an existing peer list
     * In the same call, advance the chain if localFinalizedEpoch >
     */
    startSyncing(localFinalizedEpoch: Epoch): void;
    /**
     * Temporarily stop the chain. Will prevent batches from being processed
     */
    stopSyncing(): void;
    /**
     * Permanently remove this chain. Throws the main AsyncIterable
     */
    remove(): void;
    /**
     * Add peer to the chain and request batches if active
     */
    addPeer(peer: PeerId, target: ChainTarget): void;
    /**
     * Returns true if the peer existed and has been removed
     * NOTE: The RangeSync will take care of deleting the SyncChain if peers = 0
     */
    removePeer(peerId: PeerId): boolean;
    /**
     * Helper to print internal state for debugging when chain gets stuck
     */
    getBatchesState(): BatchMetadata[];
    get startEpochValue(): Epoch;
    get isSyncing(): boolean;
    get isRemovable(): boolean;
    get peers(): number;
    getPeers(): PeerId[];
    /** Full debug state for lodestar API */
    getDebugState(): SyncChainDebugState;
    private computeTarget;
    /**
     * Main Promise that handles the sync process. Will resolve when initial sync completes
     * i.e. when it successfully processes a epoch >= than this chain `targetEpoch`
     */
    private sync;
    /**
     * Request to process batches if possible
     */
    private triggerBatchProcessor;
    /**
     * Request to download batches if possible
     * Backlogs requests into a single pending request
     */
    private triggerBatchDownloader;
    /**
     * Attempts to request the next required batches from the peer pool if the chain is syncing.
     * It will exhaust the peer pool and left over batches until the batch buffer is reached.
     */
    private requestBatches;
    /**
     * Creates the next required batch from the chain. If there are no more batches required, returns `null`.
     */
    private includeNextBatch;
    /**
     * Requests the batch asigned to the given id from a given peer.
     */
    private sendBatch;
    /**
     * Sends `batch` to the processor. Note: batch may be empty
     */
    private processBatch;
    /**
     * Drops any batches previous to `newStartEpoch` and updates the chain boundaries
     */
    private advanceChain;
}
/**
 * Enforces that a report peer action is defined for all BatchErrorCode exhaustively.
 * If peer should not be downscored, returns null.
 */
export declare function shouldReportPeerOnBatchError(code: BatchErrorCode): {
    action: PeerAction.LowToleranceError;
    reason: string;
} | null;
//# sourceMappingURL=chain.d.ts.map