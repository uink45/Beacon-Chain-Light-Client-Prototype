import PeerId from "peer-id";
import { Batch } from "../batch";
/**
 * Balance and organize peers to perform requests with a SyncChain
 * Shuffles peers only once on instantiation
 */
export declare class ChainPeersBalancer {
    private peers;
    private activeRequestsByPeer;
    constructor(peers: PeerId[], batches: Batch[]);
    /**
     * Return the most suitable peer to retry
     * Sort peers by (1) no failed request (2) less active requests, then pick first
     */
    bestPeerToRetryBatch(batch: Batch): PeerId | undefined;
    /**
     * Return peers with 0 or no active requests
     */
    idlePeers(): PeerId[];
}
//# sourceMappingURL=peerBalancer.d.ts.map