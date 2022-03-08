import MetadataBook from "libp2p/src/peer-store/metadata-book";
import PeerId from "peer-id";
import { altair } from "@chainsafe/lodestar-types";
import { ReqRespEncoding } from "../reqresp";
/**
 * Get/set data about peers.
 */
export interface IPeerMetadataStore {
    encoding: PeerStoreBucket<ReqRespEncoding>;
    metadata: PeerStoreBucket<altair.Metadata>;
    rpcScore: PeerStoreBucket<number>;
    rpcScoreLastUpdate: PeerStoreBucket<number>;
}
export declare type PeerStoreBucket<T> = {
    set: (peer: PeerId, value: T) => void;
    get: (peer: PeerId) => T | undefined;
};
/**
 * Wrapper around Libp2p.peerstore.metabook
 * that uses ssz serialization to store data
 */
export declare class Libp2pPeerMetadataStore implements IPeerMetadataStore {
    encoding: PeerStoreBucket<ReqRespEncoding>;
    metadata: PeerStoreBucket<altair.Metadata>;
    rpcScore: PeerStoreBucket<number>;
    rpcScoreLastUpdate: PeerStoreBucket<number>;
    private readonly metabook;
    constructor(metabook: MetadataBook);
    private typedStore;
}
//# sourceMappingURL=metastore.d.ts.map