/// <reference types="node" />
import { EventEmitter } from "events";
import StrictEventEmitter from "strict-event-emitter-types";
import PeerId from "peer-id";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { phase0 } from "@chainsafe/lodestar-types";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IBeaconChain } from "../../chain";
import { INetwork } from "../../network";
import { IMetrics } from "../../metrics";
import { ChainTarget, SyncChainOpts, SyncChainDebugState } from "./chain";
export declare enum RangeSyncEvent {
    completedChain = "RangeSync-completedChain"
}
declare type RangeSyncEvents = {
    [RangeSyncEvent.completedChain]: () => void;
};
declare type RangeSyncEmitter = StrictEventEmitter<EventEmitter, RangeSyncEvents>;
export declare enum RangeSyncStatus {
    /** A finalized chain is being synced */
    Finalized = 0,
    /** There are no finalized chains and we are syncing one more head chains */
    Head = 1,
    /** There are no head or finalized chains and no long range sync is in progress */
    Idle = 2
}
declare type RangeSyncState = {
    status: RangeSyncStatus.Finalized;
    target: ChainTarget;
} | {
    status: RangeSyncStatus.Head;
    targets: ChainTarget[];
} | {
    status: RangeSyncStatus.Idle;
};
export declare type RangeSyncModules = {
    chain: IBeaconChain;
    network: INetwork;
    metrics: IMetrics | null;
    config: IBeaconConfig;
    logger: ILogger;
};
export declare type RangeSyncOpts = SyncChainOpts & {
    disableProcessAsChainSegment?: boolean;
};
declare const RangeSync_base: new () => RangeSyncEmitter;
/**
 * RangeSync groups peers by their `status` into static target `SyncChain` instances
 * Peers on each chain will be queried for batches until reaching their target.
 *
 * Not all SyncChain-s will sync at once, and are grouped by sync type:
 * - Finalized Chain Sync
 * - Head Chain Sync
 *
 * ### Finalized Chain Sync
 *
 * At least one peer's status finalized checkpoint is greater than ours. Then we'll form
 * a chain starting from our finalized epoch and sync up to their finalized checkpoint.
 * - Only one finalized chain can sync at a time
 * - The finalized chain with the largest peer pool takes priority
 * - As peers' status progresses we will switch to a SyncChain with a better target
 *
 * ### Head Chain Sync
 *
 * If no Finalized Chain Sync is active, and the peer's STATUS head is beyond
 * `SLOT_IMPORT_TOLERANCE`, then we'll form a chain starting from our finalized epoch and sync
 * up to their head.
 * - More than one head chain can sync in parallel
 * - If there are many head chains the ones with more peers take priority
 */
export declare class RangeSync extends RangeSync_base {
    private readonly chain;
    private readonly network;
    private readonly metrics;
    private readonly config;
    private readonly logger;
    /** There is a single chain per type, 1 finalized sync, 1 head sync */
    private readonly chains;
    private opts?;
    constructor(modules: RangeSyncModules, opts?: RangeSyncOpts);
    /** Throw / return all AsyncGenerators inside every SyncChain instance */
    close(): void;
    /**
     * A peer with a relevant STATUS message has been found, which also is advanced from us.
     * Add this peer to an existing chain or create a new one. The update the chains status.
     */
    addPeer(peerId: PeerId, localStatus: phase0.Status, peerStatus: phase0.Status): void;
    /**
     * Remove this peer from all head and finalized chains. A chain may become peer-empty and be dropped
     */
    removePeer(peerId: PeerId): void;
    /**
     * Compute the current RangeSync state, not cached
     */
    get state(): RangeSyncState;
    /** Full debug state for lodestar API */
    getSyncChainsDebugState(): SyncChainDebugState[];
    /** Convenience method for `SyncChain` */
    private processChainSegment;
    /** Convenience method for `SyncChain` */
    private downloadBeaconBlocksByRange;
    /** Convenience method for `SyncChain` */
    private reportPeer;
    /** Convenience method for `SyncChain` */
    private onSyncChainEnd;
    private addPeerOrCreateChain;
    private update;
    private scrapeMetrics;
}
export {};
//# sourceMappingURL=range.d.ts.map