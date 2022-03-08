/**
 * @module network
 */
import PeerId from "peer-id";
import { Multiaddr } from "multiaddr";
import { ENR } from "@chainsafe/discv5";
import MetadataBook from "libp2p/src/peer-store/metadata-book";
import { ClientKind } from "./peers/client";
/**
 * Return a fresh PeerId instance
 */
export declare function createPeerId(): Promise<PeerId>;
/**
 * Check if multiaddr belongs to the local network interfaces.
 */
export declare function isLocalMultiAddr(multiaddr: Multiaddr | undefined): boolean;
export declare function clearMultiaddrUDP(enr: ENR): void;
export declare function prettyPrintPeerId(peerId: PeerId): string;
export declare function getClientFromPeerStore(peerId: PeerId, metadataBook: MetadataBook): ClientKind;
export declare function getAgentVersionFromPeerStore(peerId: PeerId, metadataBook: MetadataBook): string;
//# sourceMappingURL=util.d.ts.map