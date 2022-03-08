/**
 * @module network/nodejs
 */
import LibP2p from "libp2p";
import Bootstrap from "libp2p-bootstrap";
import MDNS from "libp2p-mdns";
import PeerId from "peer-id";
import { Datastore } from "interface-datastore";
export interface ILibp2pOptions {
    peerId: PeerId;
    addresses: {
        listen: string[];
        announce?: string[];
    };
    datastore?: Datastore;
    peerDiscovery?: (typeof Bootstrap | typeof MDNS)[];
    bootMultiaddrs?: string[];
    maxConnections?: number;
    minConnections?: number;
}
export declare class NodejsNode extends LibP2p {
    constructor(options: ILibp2pOptions);
}
//# sourceMappingURL=bundle.d.ts.map