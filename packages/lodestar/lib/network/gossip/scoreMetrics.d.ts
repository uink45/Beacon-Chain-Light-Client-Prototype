import { PeerScoreParams } from "libp2p-gossipsub/src/score";
import { PeerStats } from "libp2p-gossipsub/src/score/peer-stats";
import { MapDef } from "../../util/map";
import { GossipType } from "./interface";
import { GossipTopicCache } from "./topic";
export declare type TopicScoreWeights<T> = {
    p1w: T;
    p2w: T;
    p3w: T;
    p3bw: T;
    p4w: T;
};
export declare type ScoreWeights<T> = {
    byTopic: MapDef<GossipType, TopicScoreWeights<T>>;
    p5w: T;
    p6w: T;
    p7w: T;
    score: T;
};
export declare function computeScoreWeights(peer: string, pstats: PeerStats, params: PeerScoreParams, peerIPs: Map<string, Set<string>>, gossipTopicCache: GossipTopicCache): ScoreWeights<number>;
export declare function computeAllPeersScoreWeights(peerIdStrs: IterableIterator<string>, peerStats: Map<string, PeerStats>, params: PeerScoreParams, peerIPs: Map<string, Set<string>>, gossipTopicCache: GossipTopicCache): ScoreWeights<number[]>;
//# sourceMappingURL=scoreMetrics.d.ts.map