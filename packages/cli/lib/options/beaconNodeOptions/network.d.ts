import { IBeaconNodeOptions } from "@chainsafe/lodestar";
import { ICliCommandOptions } from "../../util";
export interface INetworkArgs {
    "network.discv5.enabled": boolean;
    "network.discv5.bindAddr": string;
    "network.discv5.bootEnrs": string[];
    "network.maxPeers": number;
    "network.targetPeers": number;
    "network.bootMultiaddrs": string[];
    "network.localMultiaddrs": string[];
    "network.subscribeAllSubnets": boolean;
    "network.connectToDiscv5Bootnodes": boolean;
    "network.discv5FirstQueryDelayMs": number;
    "network.requestCountPeerLimit": number;
    "network.blockCountTotalLimit": number;
    "network.blockCountPeerLimit": number;
    "network.rateTrackerTimeoutMs": number;
    "network.dontSendGossipAttestationsToForkchoice": boolean;
}
export declare function parseArgs(args: INetworkArgs): IBeaconNodeOptions["network"];
export declare const options: ICliCommandOptions<INetworkArgs>;
//# sourceMappingURL=network.d.ts.map