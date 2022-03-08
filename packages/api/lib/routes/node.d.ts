import { allForks, Slot } from "@chainsafe/lodestar-types";
import { ReturnTypes, RoutesData, ReqSerializers, ReqEmpty } from "../utils";
export declare type NetworkIdentity = {
    /** Cryptographic hash of a peer’s public key. [Read more](https://docs.libp2p.io/concepts/peer-id/) */
    peerId: string;
    /** Ethereum node record. [Read more](https://eips.ethereum.org/EIPS/eip-778) */
    enr: string;
    p2pAddresses: string[];
    discoveryAddresses: string[];
    /** Based on eth2 [Metadata object](https://github.com/ethereum/eth2.0-specs/blob/v1.0.1/specs/phase0/p2p-interface.md#metadata) */
    metadata: allForks.Metadata;
};
export declare type PeerState = "disconnected" | "connecting" | "connected" | "disconnecting";
export declare type PeerDirection = "inbound" | "outbound";
export declare type NodePeer = {
    peerId: string;
    enr: string;
    lastSeenP2pAddress: string;
    state: PeerState;
    direction: PeerDirection | null;
};
export declare type PeerCount = {
    disconnected: number;
    connecting: number;
    connected: number;
    disconnecting: number;
};
export declare type FilterGetPeers = {
    state?: PeerState[];
    direction?: PeerDirection[];
};
export declare type SyncingStatus = {
    /** Head slot node is trying to reach */
    headSlot: Slot;
    /** How many slots node needs to process to reach head. 0 if synced. */
    syncDistance: Slot;
    /** Set to true if the node is syncing, false if the node is synced. */
    isSyncing: boolean;
};
export declare enum NodeHealth {
    READY = 200,
    SYNCING = 206,
    NOT_INITIALIZED_OR_ISSUES = 503
}
/**
 * Read information about the beacon node.
 */
export declare type Api = {
    /**
     * Get node network identity
     * Retrieves data about the node's network presence
     */
    getNetworkIdentity(): Promise<{
        data: NetworkIdentity;
    }>;
    /**
     * Get node network peers
     * Retrieves data about the node's network peers. By default this returns all peers. Multiple query params are combined using AND conditions
     * @param state
     * @param direction
     */
    getPeers(filters?: FilterGetPeers): Promise<{
        data: NodePeer[];
        meta: {
            count: number;
        };
    }>;
    /**
     * Get peer
     * Retrieves data about the given peer
     * @param peerId
     */
    getPeer(peerId: string): Promise<{
        data: NodePeer;
    }>;
    /**
     * Get peer count
     * Retrieves number of known peers.
     */
    getPeerCount(): Promise<{
        data: PeerCount;
    }>;
    /**
     * Get version string of the running beacon node.
     * Requests that the beacon node identify information about its implementation in a format similar to a [HTTP User-Agent](https://tools.ietf.org/html/rfc7231#section-5.5.3) field.
     */
    getNodeVersion(): Promise<{
        data: {
            version: string;
        };
    }>;
    /**
     * Get node syncing status
     * Requests the beacon node to describe if it's currently syncing or not, and if it is, what block it is up to.
     */
    getSyncingStatus(): Promise<{
        data: SyncingStatus;
    }>;
    /**
     * Get health check
     * Returns node health status in http status codes. Useful for load balancers.
     *
     * NOTE: This route does not return any value
     */
    getHealth(): Promise<NodeHealth>;
};
export declare const routesData: RoutesData<Api>;
export declare type ReqTypes = {
    getNetworkIdentity: ReqEmpty;
    getPeers: {
        query: {
            state?: PeerState[];
            direction?: PeerDirection[];
        };
    };
    getPeer: {
        params: {
            peerId: string;
        };
    };
    getPeerCount: ReqEmpty;
    getNodeVersion: ReqEmpty;
    getSyncingStatus: ReqEmpty;
    getHealth: ReqEmpty;
};
export declare function getReqSerializers(): ReqSerializers<Api, ReqTypes>;
export declare function getReturnTypes(): ReturnTypes<Api>;
//# sourceMappingURL=node.d.ts.map