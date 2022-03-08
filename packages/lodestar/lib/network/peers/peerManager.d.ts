import LibP2p from "libp2p";
import PeerId from "peer-id";
import { IDiscv5DiscoveryInputOptions } from "@chainsafe/discv5";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IBeaconChain } from "../../chain";
import { IMetrics } from "../../metrics";
import { INetworkEventBus } from "../events";
import { IReqResp } from "../reqresp";
import { ISubnetsService } from "../subnets";
import { Libp2pPeerMetadataStore } from "./metastore";
import { IPeerRpcScoreStore } from "./score";
export declare type PeerManagerOpts = {
    /** The target number of peers we would like to connect to. */
    targetPeers: number;
    /** The maximum number of peers we allow (exceptions for subnet peers) */
    maxPeers: number;
    /**
     * Delay the 1st query after starting discv5
     * See https://github.com/ChainSafe/lodestar/issues/3423
     */
    discv5FirstQueryDelayMs: number;
    /**
     * If null, Don't run discv5 queries, nor connect to cached peers in the peerStore
     */
    discv5: IDiscv5DiscoveryInputOptions | null;
    /**
     * If set to true, connect to Discv5 bootnodes. If not set or false, do not connect
     */
    connectToDiscv5Bootnodes?: boolean;
};
export declare type PeerManagerModules = {
    libp2p: LibP2p;
    logger: ILogger;
    metrics: IMetrics | null;
    reqResp: IReqResp;
    attnetsService: ISubnetsService;
    syncnetsService: ISubnetsService;
    chain: IBeaconChain;
    config: IBeaconConfig;
    peerMetadata: Libp2pPeerMetadataStore;
    peerRpcScores: IPeerRpcScoreStore;
    networkEventBus: INetworkEventBus;
};
/**
 * Performs all peer managment functionality in a single grouped class:
 * - Ping peers every `PING_INTERVAL_MS`
 * - Status peers every `STATUS_INTERVAL_MS`
 * - Execute discovery query if under target peers
 * - Execute discovery query if need peers on some subnet: TODO
 * - Disconnect peers if over target peers
 */
export declare class PeerManager {
    private libp2p;
    private logger;
    private metrics;
    private reqResp;
    private attnetsService;
    private syncnetsService;
    private chain;
    private config;
    private peerMetadata;
    private peerRpcScores;
    /** If null, discovery is disabled */
    private discovery;
    private networkEventBus;
    private connectedPeers;
    private opts;
    private intervals;
    constructor(modules: PeerManagerModules, opts: PeerManagerOpts);
    start(): Promise<void>;
    stop(): Promise<void>;
    /**
     * Return peers with at least one connection in status "open"
     */
    getConnectedPeerIds(): PeerId[];
    /**
     * Efficiently check if there is at least one peer connected
     */
    hasSomeConnectedPeer(): boolean;
    goodbyeAndDisconnectAllPeers(): Promise<void>;
    /**
     * Run after validator subscriptions request.
     */
    onCommitteeSubscriptions(): void;
    /**
     * The app layer needs to refresh the status of some peers. The sync have reached a target
     */
    reStatusPeers(peers: PeerId[]): void;
    /**
     * Must be called when network ReqResp receives incoming requests
     */
    private onRequest;
    /**
     * Handle a PING request + response (rpc handler responds with PONG automatically)
     */
    private onPing;
    /**
     * Handle a METADATA request + response (rpc handler responds with METADATA automatically)
     */
    private onMetadata;
    /**
     * Handle a GOODBYE request (rpc handler responds automatically)
     */
    private onGoodbye;
    /**
     * Handle a STATUS request + response (rpc handler responds with STATUS automatically)
     */
    private onStatus;
    private requestMetadata;
    private requestPing;
    private requestStatus;
    private requestStatusMany;
    /**
     * The Peer manager's heartbeat maintains the peer count and maintains peer reputations.
     * It will request discovery queries if the peer count has not reached the desired number of peers.
     * NOTE: Discovery should only add a new query if one isn't already queued.
     */
    private heartbeat;
    private pingAndStatusTimeouts;
    /**
     * The libp2p Upgrader has successfully upgraded a peer connection on a particular multiaddress
     * This event is routed through the connectionManager
     *
     * Registers a peer as connected. The `direction` parameter determines if the peer is being
     * dialed or connecting to us.
     */
    private onLibp2pPeerConnect;
    /**
     * The libp2p Upgrader has ended a connection
     */
    private onLibp2pPeerDisconnect;
    private disconnect;
    private goodbyeAndDisconnect;
    /** Register peer count metrics */
    private runPeerCountMetrics;
}
//# sourceMappingURL=peerManager.d.ts.map