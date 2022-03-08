"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboundRateLimiter = exports.defaultRateLimiterOpts = void 0;
const map_1 = require("../../../util/map");
const score_1 = require("../../peers/score");
const rateTracker_1 = require("../rateTracker");
const types_1 = require("../types");
/** Sometimes a peer request comes AFTER libp2p disconnect event, check for such peers every 10 minutes */
const CHECK_DISCONNECTED_PEERS_INTERVAL_MS = 10 * 60 * 1000;
/** Peers don't request us for 5 mins are considered disconnected */
const DISCONNECTED_TIMEOUT_MS = 5 * 60 * 1000;
/**
 * Default value for RateLimiterOpts
 * - requestCountPeerLimit: allow to serve 50 requests per peer within 1 minute
 * - blockCountPeerLimit: allow to serve 500 blocks per peer within 1 minute
 * - blockCountTotalLimit: allow to serve 2000 (blocks) for all peer within 1 minute (4 x blockCountPeerLimit)
 * - rateTrackerTimeoutMs: 1 minute
 */
exports.defaultRateLimiterOpts = {
    requestCountPeerLimit: 50,
    blockCountPeerLimit: 500,
    blockCountTotalLimit: 2000,
    rateTrackerTimeoutMs: 60 * 1000,
};
/**
 * This class is singleton, it has per-peer request count rate tracker and block count rate tracker
 * and a block count rate tracker for all peers (this is lodestar specific).
 */
class InboundRateLimiter {
    constructor(opts, modules) {
        /** Interval to check lastSeenMessagesByPeer */
        this.cleanupInterval = undefined;
        this.requestCountTrackersByPeer = new map_1.MapDef(() => new rateTracker_1.RateTracker({ limit: opts.requestCountPeerLimit, timeoutMs: opts.rateTrackerTimeoutMs }));
        this.blockCountTotalTracker = new rateTracker_1.RateTracker({
            limit: opts.blockCountTotalLimit,
            timeoutMs: opts.rateTrackerTimeoutMs,
        });
        this.blockCountTrackersByPeer = new map_1.MapDef(() => new rateTracker_1.RateTracker({ limit: opts.blockCountPeerLimit, timeoutMs: opts.rateTrackerTimeoutMs }));
        this.logger = modules.logger;
        this.peerRpcScores = modules.peerRpcScores;
        this.metrics = modules.metrics;
        this.lastSeenRequestsByPeer = new Map();
    }
    start() {
        this.cleanupInterval = setInterval(this.checkDisconnectedPeers.bind(this), CHECK_DISCONNECTED_PEERS_INTERVAL_MS);
    }
    stop() {
        if (this.cleanupInterval !== undefined) {
            clearInterval(this.cleanupInterval);
        }
    }
    /**
     * Tracks a request from a peer and returns whether to allow the request based on the configured rate limit params.
     */
    allowRequest(peerId, requestTyped) {
        const peerIdStr = peerId.toB58String();
        this.lastSeenRequestsByPeer.set(peerIdStr, Date.now());
        // rate limit check for request
        const requestCountPeerTracker = this.requestCountTrackersByPeer.getOrDefault(peerIdStr);
        if (requestCountPeerTracker.requestObjects(1) === 0) {
            this.logger.verbose("Do not serve request due to request count rate limit", {
                peerId: peerIdStr,
                requestsWithinWindow: requestCountPeerTracker.getRequestedObjectsWithinWindow(),
            });
            this.peerRpcScores.applyAction(peerId, score_1.PeerAction.Fatal, "RateLimit");
            if (this.metrics) {
                this.metrics.reqRespRateLimitErrors.inc({ tracker: "requestCountPeerTracker" });
            }
            return false;
        }
        let numBlock = 0;
        switch (requestTyped.method) {
            case types_1.Method.BeaconBlocksByRange:
                numBlock = requestTyped.body.count;
                break;
            case types_1.Method.BeaconBlocksByRoot:
                numBlock = requestTyped.body.length;
                break;
        }
        // rate limit check for block count
        if (numBlock > 0) {
            const blockCountPeerTracker = this.blockCountTrackersByPeer.getOrDefault(peerIdStr);
            if (blockCountPeerTracker.requestObjects(numBlock) === 0) {
                this.logger.verbose("Do not serve block request due to block count rate limit", {
                    peerId: peerIdStr,
                    blockCount: numBlock,
                    requestsWithinWindow: blockCountPeerTracker.getRequestedObjectsWithinWindow(),
                });
                this.peerRpcScores.applyAction(peerId, score_1.PeerAction.Fatal, "RateLimit");
                if (this.metrics) {
                    this.metrics.reqRespRateLimitErrors.inc({ tracker: "blockCountPeerTracker" });
                }
                return false;
            }
            if (this.blockCountTotalTracker.requestObjects(numBlock) === 0) {
                if (this.metrics) {
                    this.metrics.reqRespRateLimitErrors.inc({ tracker: "blockCountTotalTracker" });
                }
                // don't apply penalty
                return false;
            }
        }
        return true;
    }
    prune(peerId) {
        const peerIdStr = peerId.toB58String();
        this.pruneByPeerIdStr(peerIdStr);
    }
    pruneByPeerIdStr(peerIdStr) {
        this.requestCountTrackersByPeer.delete(peerIdStr);
        this.blockCountTrackersByPeer.delete(peerIdStr);
        this.lastSeenRequestsByPeer.delete(peerIdStr);
    }
    checkDisconnectedPeers() {
        const now = Date.now();
        for (const [peerIdStr, lastSeenTime] of this.lastSeenRequestsByPeer.entries()) {
            if (now - lastSeenTime >= DISCONNECTED_TIMEOUT_MS) {
                this.pruneByPeerIdStr(peerIdStr);
            }
        }
    }
}
exports.InboundRateLimiter = InboundRateLimiter;
//# sourceMappingURL=rateLimiter.js.map