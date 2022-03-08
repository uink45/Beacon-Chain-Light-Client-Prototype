import { IBeaconSync, ISyncModules, SyncingStatus } from "./interface";
import { SyncState, SyncChainDebugState } from "./interface";
import { SyncOptions } from "./options";
export declare class BeaconSync implements IBeaconSync {
    private readonly logger;
    private readonly network;
    private readonly chain;
    private readonly metrics;
    private readonly opts;
    private readonly rangeSync;
    private readonly unknownBlockSync;
    /** For metrics only */
    private readonly peerSyncType;
    /**
     * The number of slots ahead of us that is allowed before starting a RangeSync
     * If a peer is within this tolerance (forwards or backwards), it is treated as a fully sync'd peer.
     *
     * This means that we consider ourselves synced (and hence subscribe to all subnets and block
     * gossip if no peers are further than this range ahead of us that we have not already downloaded
     * blocks for.
     */
    private readonly slotImportTolerance;
    constructor(opts: SyncOptions, modules: ISyncModules);
    close(): void;
    getSyncStatus(): SyncingStatus;
    isSyncing(): boolean;
    isSynced(): boolean;
    get state(): SyncState;
    /** Full debug state for lodestar API */
    getSyncChainsDebugState(): SyncChainDebugState[];
    /**
     * A peer has connected which has blocks that are unknown to us.
     *
     * This function handles the logic associated with the connection of a new peer. If the peer
     * is sufficiently ahead of our current head, a range-sync (batch) sync is started and
     * batches of blocks are queued to download from the peer. Batched blocks begin at our latest
     * finalized head.
     *
     * If the peer is within the `SLOT_IMPORT_TOLERANCE`, then it's head is sufficiently close to
     * ours that we consider it fully sync'd with respect to our current chain.
     */
    private addPeer;
    /**
     * Must be called by libp2p when a peer is removed from the peer manager
     */
    private removePeer;
    /**
     * Run this function when the sync state can potentially change.
     */
    private updateSyncState;
    private onClockEpoch;
    private scrapeMetrics;
}
//# sourceMappingURL=sync.d.ts.map