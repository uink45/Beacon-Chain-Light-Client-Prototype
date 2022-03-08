import { ILogger } from "@chainsafe/lodestar-utils";
import PeerId from "peer-id";
import { IMetrics } from "../../../metrics";
import { IPeerRpcScoreStore } from "../../peers/score";
import { IRateLimiter } from "../interface";
import { RequestTypedContainer } from "../types";
interface IRateLimiterModules {
    logger: ILogger;
    peerRpcScores: IPeerRpcScoreStore;
    metrics: IMetrics | null;
}
/**
 * Options:
 * - requestCountPeerLimit: maximum request count we can serve per peer within rateTrackerTimeoutMs
 * - blockCountPeerLimit: maximum block count we can serve per peer within rateTrackerTimeoutMs
 * - blockCountTotalLimit: maximum block count we can serve for all peers within rateTrackerTimeoutMs
 * - rateTrackerTimeoutMs: the time period we want to track total requests or objects, normally 1 min
 */
export declare type RateLimiterOpts = {
    requestCountPeerLimit: number;
    blockCountPeerLimit: number;
    blockCountTotalLimit: number;
    rateTrackerTimeoutMs: number;
};
/**
 * Default value for RateLimiterOpts
 * - requestCountPeerLimit: allow to serve 50 requests per peer within 1 minute
 * - blockCountPeerLimit: allow to serve 500 blocks per peer within 1 minute
 * - blockCountTotalLimit: allow to serve 2000 (blocks) for all peer within 1 minute (4 x blockCountPeerLimit)
 * - rateTrackerTimeoutMs: 1 minute
 */
export declare const defaultRateLimiterOpts: {
    requestCountPeerLimit: number;
    blockCountPeerLimit: number;
    blockCountTotalLimit: number;
    rateTrackerTimeoutMs: number;
};
/**
 * This class is singleton, it has per-peer request count rate tracker and block count rate tracker
 * and a block count rate tracker for all peers (this is lodestar specific).
 */
export declare class InboundRateLimiter implements IRateLimiter {
    private readonly logger;
    private readonly peerRpcScores;
    private readonly metrics;
    private requestCountTrackersByPeer;
    /**
     * This rate tracker is specific to lodestar, we don't want to serve too many blocks for peers at the
     * same time, even through we limit block count per peer as in blockCountTrackersByPeer
     */
    private blockCountTotalTracker;
    private blockCountTrackersByPeer;
    /** Periodically check this to remove tracker of disconnected peers */
    private lastSeenRequestsByPeer;
    /** Interval to check lastSeenMessagesByPeer */
    private cleanupInterval;
    constructor(opts: RateLimiterOpts, modules: IRateLimiterModules);
    start(): void;
    stop(): void;
    /**
     * Tracks a request from a peer and returns whether to allow the request based on the configured rate limit params.
     */
    allowRequest(peerId: PeerId, requestTyped: RequestTypedContainer): boolean;
    prune(peerId: PeerId): void;
    private pruneByPeerIdStr;
    private checkDisconnectedPeers;
}
export {};
//# sourceMappingURL=rateLimiter.d.ts.map