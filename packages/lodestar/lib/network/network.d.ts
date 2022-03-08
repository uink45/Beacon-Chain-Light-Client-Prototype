/**
 * @module network
 */
import LibP2p, { Connection } from "libp2p";
import PeerId from "peer-id";
import { Multiaddr } from "multiaddr";
import { AbortSignal } from "@chainsafe/abort-controller";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { ILogger } from "@chainsafe/lodestar-utils";
import { Discv5, ENR } from "@chainsafe/discv5";
import { IMetrics } from "../metrics";
import { IBeaconChain } from "../chain";
import { INetworkOptions } from "./options";
import { INetwork } from "./interface";
import { IReqResp, IReqRespOptions, ReqRespHandlers } from "./reqresp";
import { Eth2Gossipsub, GossipHandlers } from "./gossip";
import { MetadataController } from "./metadata";
import { IPeerMetadataStore } from "./peers/metastore";
import { PeerAction } from "./peers";
import { INetworkEventBus } from "./events";
import { AttnetsService, SyncnetsService, CommitteeSubscription } from "./subnets";
interface INetworkModules {
    config: IBeaconConfig;
    libp2p: LibP2p;
    logger: ILogger;
    metrics: IMetrics | null;
    chain: IBeaconChain;
    reqRespHandlers: ReqRespHandlers;
    signal: AbortSignal;
    gossipHandlers?: GossipHandlers;
}
export declare class Network implements INetwork {
    private readonly opts;
    events: INetworkEventBus;
    reqResp: IReqResp;
    attnetsService: AttnetsService;
    syncnetsService: SyncnetsService;
    gossip: Eth2Gossipsub;
    metadata: MetadataController;
    peerMetadata: IPeerMetadataStore;
    private readonly peerRpcScores;
    private readonly peerManager;
    private readonly libp2p;
    private readonly logger;
    private readonly config;
    private readonly clock;
    private readonly chain;
    private subscribedForks;
    constructor(opts: INetworkOptions & IReqRespOptions, modules: INetworkModules);
    /** Destroy this instance. Can only be called once. */
    close(): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    get discv5(): Discv5 | undefined;
    get localMultiaddrs(): Multiaddr[];
    get peerId(): PeerId;
    getEnr(): ENR | undefined;
    getConnectionsByPeer(): Map<string, Connection[]>;
    getConnectedPeers(): PeerId[];
    hasSomeConnectedPeer(): boolean;
    /**
     * Request att subnets up `toSlot`. Network will ensure to mantain some peers for each
     */
    prepareBeaconCommitteeSubnet(subscriptions: CommitteeSubscription[]): void;
    prepareSyncCommitteeSubnets(subscriptions: CommitteeSubscription[]): void;
    /**
     * The app layer needs to refresh the status of some peers. The sync have reached a target
     */
    reStatusPeers(peers: PeerId[]): void;
    reportPeer(peer: PeerId, action: PeerAction, actionName?: string): void;
    /**
     * Subscribe to all gossip events. Safe to call multiple times
     */
    subscribeGossipCoreTopics(): void;
    /**
     * Unsubscribe from all gossip events. Safe to call multiple times
     */
    unsubscribeGossipCoreTopics(): void;
    isSubscribedToGossipCoreTopics(): boolean;
    connectToPeer(peer: PeerId, multiaddr: Multiaddr[]): Promise<void>;
    disconnectPeer(peer: PeerId): Promise<void>;
    /**
     * Handle subscriptions through fork transitions, @see FORK_EPOCH_LOOKAHEAD
     */
    private onEpoch;
    private subscribeCoreTopicsAtFork;
    private unsubscribeCoreTopicsAtFork;
}
export {};
//# sourceMappingURL=network.d.ts.map