import PeerId from "peer-id";
import { altair, phase0 } from "@chainsafe/lodestar-types";
import { RequestedSubnet } from "./subnetMap";
declare type SubnetDiscvQuery = {
    subnet: number;
    toSlot: number;
    maxPeersToDiscover: number;
};
/**
 * Prioritize which peers to disconect and which to connect. Conditions:
 * - Reach `targetPeers`
 * - Don't exceed `maxPeers`
 * - Ensure there are enough peers per active subnet
 * - Prioritize peers with good score
 */
export declare function prioritizePeers(connectedPeers: {
    id: PeerId;
    attnets: phase0.AttestationSubnets;
    syncnets: altair.SyncSubnets;
    score: number;
}[], activeAttnets: RequestedSubnet[], activeSyncnets: RequestedSubnet[], { targetPeers, maxPeers }: {
    targetPeers: number;
    maxPeers: number;
}): {
    peersToConnect: number;
    peersToDisconnect: PeerId[];
    attnetQueries: SubnetDiscvQuery[];
    syncnetQueries: SubnetDiscvQuery[];
};
export {};
//# sourceMappingURL=prioritizePeers.d.ts.map