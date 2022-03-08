import PeerId from "peer-id";
import { IBeaconNodeOptions } from "@chainsafe/lodestar";
import { ENR } from "@chainsafe/discv5";
export interface IENRJson {
    ip?: string;
    tcp?: number;
    ip6?: string;
    udp?: number;
    tcp6?: number;
    udp6?: number;
}
export declare function createEnr(peerId: PeerId): ENR;
export declare function writeEnr(filepath: string, enr: ENR, peerId: PeerId): void;
export declare function readEnr(filepath: string): ENR;
export declare function initEnr(filepath: string, peerId: PeerId): void;
export declare function overwriteEnrWithCliArgs(enr: ENR, enrArgs: IENRJson, options: IBeaconNodeOptions): void;
//# sourceMappingURL=enr.d.ts.map