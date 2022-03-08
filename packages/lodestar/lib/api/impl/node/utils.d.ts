import { routes } from "@chainsafe/lodestar-api";
import { Connection } from "libp2p";
/**
 * Format a list of connections from libp2p connections manager into the API's format NodePeer
 */
export declare function formatNodePeer(peerIdStr: string, connections: Connection[]): routes.node.NodePeer;
//# sourceMappingURL=utils.d.ts.map