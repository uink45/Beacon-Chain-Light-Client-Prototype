import LibP2p from "libp2p";
import PeerId from "peer-id";
/**
 * Return peers with at least one connection in status "open"
 */
export declare function getConnectedPeerIds(libp2p: LibP2p): PeerId[];
/**
 * Efficiently check if there is at least one peer connected
 */
export declare function hasSomeConnectedPeer(libp2p: LibP2p): boolean;
//# sourceMappingURL=getConnectedPeerIds.d.ts.map