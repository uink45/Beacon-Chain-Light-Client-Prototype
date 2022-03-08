import { Epoch, RootHex, Slot } from "@chainsafe/lodestar-types";
import { Json } from "@chainsafe/ssz";
import { ReqEmpty, ReturnTypes, ReqSerializers, RoutesData } from "../utils";
export declare type SyncChainDebugState = {
    targetRoot: string | null;
    targetSlot: number | null;
    syncType: string;
    status: string;
    startEpoch: number;
    peers: number;
    batches: any[];
};
export declare type GossipQueueItem = {
    topic: unknown;
    receivedFrom: string;
    data: Uint8Array;
    addedTimeMs: number;
};
export declare type RegenQueueItem = {
    key: string;
    args: Json;
    addedTimeMs: number;
};
export declare type BlockProcessorQueueItem = {
    blockSlots: Slot[];
    jobOpts: Record<string, boolean | undefined>;
    addedTimeMs: number;
};
export declare type StateCacheItem = {
    slot: Slot;
    root: RootHex;
    /** Total number of reads */
    reads: number;
    /** Unix timestamp (ms) of the last read */
    lastRead: number;
};
export declare type Api = {
    /** TODO: description */
    getWtfNode(): Promise<{
        data: string;
    }>;
    /** Trigger to write a heapdump to disk at `dirpath`. May take > 1min */
    writeHeapdump(dirpath?: string): Promise<{
        data: {
            filepath: string;
        };
    }>;
    /** TODO: description */
    getLatestWeakSubjectivityCheckpointEpoch(): Promise<{
        data: Epoch;
    }>;
    /** TODO: description */
    getSyncChainsDebugState(): Promise<{
        data: SyncChainDebugState[];
    }>;
    /** Dump all items in a gossip queue, by gossipType */
    getGossipQueueItems(gossipType: string): Promise<GossipQueueItem[]>;
    /** Dump all items in the regen queue */
    getRegenQueueItems(): Promise<RegenQueueItem[]>;
    /** Dump all items in the block processor queue */
    getBlockProcessorQueueItems(): Promise<BlockProcessorQueueItem[]>;
    /** Dump a summary of the states in the StateContextCache */
    getStateCacheItems(): Promise<StateCacheItem[]>;
    /** Dump a summary of the states in the CheckpointStateCache */
    getCheckpointStateCacheItems(): Promise<StateCacheItem[]>;
    /** Run GC with `global.gc()` */
    runGC(): Promise<void>;
    /** Drop all states in the state cache */
    dropStateCache(): Promise<void>;
    /** Connect to peer at this multiaddress */
    connectPeer(peerId: string, multiaddrStrs: string[]): Promise<void>;
    /** Disconnect peer */
    disconnectPeer(peerId: string): Promise<void>;
    /** Dump Discv5 Kad values */
    discv5GetKadValues(): Promise<{
        data: string[];
    }>;
};
/**
 * Define javascript values for each route
 */
export declare const routesData: RoutesData<Api>;
export declare type ReqTypes = {
    getWtfNode: ReqEmpty;
    writeHeapdump: {
        query: {
            dirpath?: string;
        };
    };
    getLatestWeakSubjectivityCheckpointEpoch: ReqEmpty;
    getSyncChainsDebugState: ReqEmpty;
    getGossipQueueItems: {
        params: {
            gossipType: string;
        };
    };
    getRegenQueueItems: ReqEmpty;
    getBlockProcessorQueueItems: ReqEmpty;
    getStateCacheItems: ReqEmpty;
    getCheckpointStateCacheItems: ReqEmpty;
    runGC: ReqEmpty;
    dropStateCache: ReqEmpty;
    connectPeer: {
        query: {
            peerId: string;
            multiaddr: string[];
        };
    };
    disconnectPeer: {
        query: {
            peerId: string;
        };
    };
    discv5GetKadValues: ReqEmpty;
};
export declare function getReqSerializers(): ReqSerializers<Api, ReqTypes>;
export declare function getReturnTypes(): ReturnTypes<Api>;
//# sourceMappingURL=lodestar.d.ts.map