import LibP2p from "libp2p";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { ILogger } from "@chainsafe/lodestar-utils";
import { Discv5, IDiscv5DiscoveryInputOptions } from "@chainsafe/discv5";
import { IMetrics } from "../../metrics";
import { SubnetType } from "../metadata";
import { IPeerRpcScoreStore } from "./score";
export declare type PeerDiscoveryOpts = {
    maxPeers: number;
    discv5FirstQueryDelayMs: number;
    discv5: Omit<IDiscv5DiscoveryInputOptions, "metrics" | "searchInterval" | "enabled">;
    connectToDiscv5Bootnodes?: boolean;
};
export declare type PeerDiscoveryModules = {
    libp2p: LibP2p;
    peerRpcScores: IPeerRpcScoreStore;
    metrics: IMetrics | null;
    logger: ILogger;
    config: IBeaconConfig;
};
declare type UnixMs = number;
export declare type SubnetDiscvQueryMs = {
    subnet: number;
    type: SubnetType;
    toUnixMs: UnixMs;
    maxPeersToDiscover: number;
};
/**
 * PeerDiscovery discovers and dials new peers, and executes discv5 queries.
 * Currently relies on discv5 automatic periodic queries.
 */
export declare class PeerDiscovery {
    readonly discv5: Discv5;
    private libp2p;
    private peerRpcScores;
    private metrics;
    private logger;
    private config;
    private cachedENRs;
    private randomNodeQuery;
    private peersToConnect;
    private subnetRequests;
    /** The maximum number of peers we allow (exceptions for subnet peers) */
    private maxPeers;
    private discv5StartMs;
    private discv5FirstQueryDelayMs;
    private connectToDiscv5BootnodesOnStart;
    constructor(modules: PeerDiscoveryModules, opts: PeerDiscoveryOpts);
    start(): Promise<void>;
    stop(): Promise<void>;
    /**
     * Request to find peers, both on specific subnets and in general
     */
    discoverPeers(peersToConnect: number, subnetRequests?: SubnetDiscvQueryMs[]): void;
    /**
     * Request to find peers. First, looked at cached peers in peerStore
     */
    private runFindRandomNodeQuery;
    /**
     * Progressively called by discv5 as a result of any query.
     */
    private onDiscovered;
    /**
     * Progressively called by discv5 as a result of any query.
     */
    private handleDiscoveredPeer;
    private shouldDialPeer;
    /**
     * Handles DiscoveryEvent::QueryResult
     * Peers that have been returned by discovery requests are dialed here if they are suitable.
     */
    private dialPeer;
    /** Check if there is 1+ open connection with this peer */
    private isPeerConnected;
}
export {};
//# sourceMappingURL=discover.d.ts.map