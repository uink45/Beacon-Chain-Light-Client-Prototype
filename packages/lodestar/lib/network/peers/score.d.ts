import PeerId from "peer-id";
import { IPeerMetadataStore } from "./metastore";
export declare enum PeerAction {
    /** Immediately ban peer */
    Fatal = "Fatal",
    /**
     * Not malicious action, but it must not be tolerated
     * ~5 occurrences will get the peer banned
     */
    LowToleranceError = "LowToleranceError",
    /**
     * Negative action that can be tolerated only sometimes
     * ~10 occurrences will get the peer banned
     */
    MidToleranceError = "MidToleranceError",
    /**
     * Some error that can be tolerated multiple times
     * ~50 occurrences will get the peer banned
     */
    HighToleranceError = "HighToleranceError"
}
export declare enum ScoreState {
    /** We are content with the peers performance. We permit connections and messages. */
    Healthy = "Healthy",
    /** The peer should be disconnected. We allow re-connections if the peer is persistent */
    Disconnected = "Disconnected",
    /** The peer is banned. We disallow new connections until it's score has decayed into a tolerable threshold */
    Banned = "Banned"
}
export interface IPeerRpcScoreStore {
    getScore(peer: PeerId): number;
    getScoreState(peer: PeerId): ScoreState;
    applyAction(peer: PeerId, action: PeerAction, actionName?: string): void;
    update(peer: PeerId): void;
}
/**
 * A peer's score (perceived potential usefulness).
 * This simplistic version consists of a global score per peer which decays to 0 over time.
 * The decay rate applies equally to positive and negative scores.
 */
export declare class PeerRpcScoreStore implements IPeerRpcScoreStore {
    private readonly store;
    constructor(store: IPeerMetadataStore);
    getScore(peer: PeerId): number;
    getScoreState(peer: PeerId): ScoreState;
    applyAction(peer: PeerId, action: PeerAction, actionName?: string): void;
    update(peer: PeerId): void;
    private decayScore;
    private add;
}
//# sourceMappingURL=score.d.ts.map