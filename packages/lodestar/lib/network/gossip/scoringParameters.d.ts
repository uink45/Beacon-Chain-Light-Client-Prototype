import { PeerScoreThresholds } from "libp2p-gossipsub/src/score";
import { PeerScoreParams } from "libp2p-gossipsub/src/score/peer-score-params";
import { IGossipsubModules } from "./gossipsub";
export declare const GOSSIP_D = 8;
export declare const GOSSIP_D_LOW = 6;
export declare const GOSSIP_D_HIGH = 12;
/**
 * The following params is implemented by Lighthouse at
 * https://github.com/sigp/lighthouse/blob/b0ac3464ca5fb1e9d75060b56c83bfaf990a3d25/beacon_node/eth2_libp2p/src/behaviour/gossipsub_scoring_parameters.rs#L83
 */
export declare const gossipScoreThresholds: PeerScoreThresholds;
/**
 * Explanation of each param https://github.com/libp2p/specs/blob/master/pubsub/gossipsub/gossipsub-v1.1.md#peer-scoring
 */
export declare function computeGossipPeerScoreParams({ config, eth2Context, }: Pick<IGossipsubModules, "config" | "eth2Context">): Partial<PeerScoreParams>;
//# sourceMappingURL=scoringParameters.d.ts.map