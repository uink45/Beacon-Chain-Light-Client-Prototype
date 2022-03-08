"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerRpcScoreStore = exports.ScoreState = exports.PeerAction = void 0;
/** The default score for new peers */
const DEFAULT_SCORE = 0;
/** The minimum reputation before a peer is disconnected */
const MIN_SCORE_BEFORE_DISCONNECT = -20;
/** The minimum reputation before a peer is banned */
const MIN_SCORE_BEFORE_BAN = -50;
/** The maximum score a peer can obtain */
const MAX_SCORE = 100;
/** The minimum score a peer can obtain */
const MIN_SCORE = -100;
/** The halflife of a peer's score. I.e the number of miliseconds it takes for the score to decay to half its value */
const SCORE_HALFLIFE_MS = 10 * 60 * 1000;
const HALFLIFE_DECAY_MS = -Math.log(2) / SCORE_HALFLIFE_MS;
/** The number of miliseconds we ban a peer for before their score begins to decay */
const BANNED_BEFORE_DECAY_MS = 1800 * 1000;
var PeerAction;
(function (PeerAction) {
    /** Immediately ban peer */
    PeerAction["Fatal"] = "Fatal";
    /**
     * Not malicious action, but it must not be tolerated
     * ~5 occurrences will get the peer banned
     */
    PeerAction["LowToleranceError"] = "LowToleranceError";
    /**
     * Negative action that can be tolerated only sometimes
     * ~10 occurrences will get the peer banned
     */
    PeerAction["MidToleranceError"] = "MidToleranceError";
    /**
     * Some error that can be tolerated multiple times
     * ~50 occurrences will get the peer banned
     */
    PeerAction["HighToleranceError"] = "HighToleranceError";
})(PeerAction = exports.PeerAction || (exports.PeerAction = {}));
const peerActionScore = {
    [PeerAction.Fatal]: -(MAX_SCORE - MIN_SCORE),
    [PeerAction.LowToleranceError]: -10,
    [PeerAction.MidToleranceError]: -5,
    [PeerAction.HighToleranceError]: -1,
};
var ScoreState;
(function (ScoreState) {
    /** We are content with the peers performance. We permit connections and messages. */
    ScoreState["Healthy"] = "Healthy";
    /** The peer should be disconnected. We allow re-connections if the peer is persistent */
    ScoreState["Disconnected"] = "Disconnected";
    /** The peer is banned. We disallow new connections until it's score has decayed into a tolerable threshold */
    ScoreState["Banned"] = "Banned";
})(ScoreState = exports.ScoreState || (exports.ScoreState = {}));
function scoreToState(score) {
    if (score <= MIN_SCORE_BEFORE_BAN)
        return ScoreState.Banned;
    if (score <= MIN_SCORE_BEFORE_DISCONNECT)
        return ScoreState.Disconnected;
    return ScoreState.Healthy;
}
/**
 * A peer's score (perceived potential usefulness).
 * This simplistic version consists of a global score per peer which decays to 0 over time.
 * The decay rate applies equally to positive and negative scores.
 */
class PeerRpcScoreStore {
    constructor(store) {
        this.store = store;
    }
    getScore(peer) {
        var _a;
        return (_a = this.store.rpcScore.get(peer)) !== null && _a !== void 0 ? _a : DEFAULT_SCORE;
    }
    getScoreState(peer) {
        return scoreToState(this.getScore(peer));
    }
    applyAction(peer, action, actionName) {
        this.add(peer, peerActionScore[action]);
        // TODO: Log action to debug + do metrics
        actionName;
    }
    update(peer) {
        this.add(peer, 0);
    }
    decayScore(peer, prevScore) {
        var _a;
        const nowMs = Date.now();
        const lastUpdate = (_a = this.store.rpcScoreLastUpdate.get(peer)) !== null && _a !== void 0 ? _a : nowMs;
        // Decay the current score
        // Using exponential decay based on a constant half life.
        const sinceLastUpdateMs = nowMs - lastUpdate;
        // If peer was banned, lastUpdate will be in the future
        if (sinceLastUpdateMs > 0 && prevScore !== 0) {
            this.store.rpcScoreLastUpdate.set(peer, nowMs);
            // e^(-ln(2)/HL*t)
            const decayFactor = Math.exp(HALFLIFE_DECAY_MS * sinceLastUpdateMs);
            return prevScore * decayFactor;
        }
        else {
            return prevScore;
        }
    }
    add(peer, scoreDelta) {
        const prevScore = this.getScore(peer);
        let newScore = this.decayScore(peer, prevScore) + scoreDelta;
        if (newScore > MAX_SCORE)
            newScore = MAX_SCORE;
        if (newScore < MIN_SCORE)
            newScore = MIN_SCORE;
        const prevState = scoreToState(prevScore);
        const newState = scoreToState(newScore);
        if (prevState !== ScoreState.Banned && newState === ScoreState.Banned) {
            // ban this peer for at least BANNED_BEFORE_DECAY_MS seconds
            this.store.rpcScoreLastUpdate.set(peer, Date.now() + BANNED_BEFORE_DECAY_MS);
        }
        this.store.rpcScore.set(peer, newScore);
    }
}
exports.PeerRpcScoreStore = PeerRpcScoreStore;
//# sourceMappingURL=score.js.map