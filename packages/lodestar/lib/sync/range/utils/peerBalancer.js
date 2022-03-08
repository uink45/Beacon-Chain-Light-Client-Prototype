"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainPeersBalancer = void 0;
const peerMap_1 = require("../../../util/peerMap");
const shuffle_1 = require("../../../util/shuffle");
const sortBy_1 = require("../../../util/sortBy");
const batch_1 = require("../batch");
/**
 * Balance and organize peers to perform requests with a SyncChain
 * Shuffles peers only once on instantiation
 */
class ChainPeersBalancer {
    constructor(peers, batches) {
        var _a;
        this.activeRequestsByPeer = new peerMap_1.PeerMap();
        this.peers = (0, shuffle_1.shuffle)(peers);
        // Compute activeRequestsByPeer from all batches internal states
        for (const batch of batches) {
            if (batch.state.status === batch_1.BatchStatus.Downloading) {
                this.activeRequestsByPeer.set(batch.state.peer, ((_a = this.activeRequestsByPeer.get(batch.state.peer)) !== null && _a !== void 0 ? _a : 0) + 1);
            }
        }
    }
    /**
     * Return the most suitable peer to retry
     * Sort peers by (1) no failed request (2) less active requests, then pick first
     */
    bestPeerToRetryBatch(batch) {
        const failedPeers = peerMap_1.PeerMap.from(batch.getFailedPeers());
        const sortedBestPeers = (0, sortBy_1.sortBy)(this.peers, (peer) => (failedPeers.has(peer) ? 1 : 0), // Sort by no failed first = 0
        (peer) => { var _a; return (_a = this.activeRequestsByPeer.get(peer)) !== null && _a !== void 0 ? _a : 0; } // Sort by least active req
        );
        return sortedBestPeers[0];
    }
    /**
     * Return peers with 0 or no active requests
     */
    idlePeers() {
        return this.peers.filter((peer) => {
            const activeRequests = this.activeRequestsByPeer.get(peer);
            return activeRequests === undefined || activeRequests === 0;
        });
    }
}
exports.ChainPeersBalancer = ChainPeersBalancer;
//# sourceMappingURL=peerBalancer.js.map