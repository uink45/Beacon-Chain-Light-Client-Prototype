/**
 * @module network/nodejs
 */
import PeerId from "peer-id";
import LibP2p from "libp2p";
import { INetworkOptions } from "../options";
export declare type NodeJsLibp2pOpts = {
    peerStoreDir?: string;
    disablePeerDiscovery?: boolean;
};
/**
 *
 * @param peerIdOrPromise Create an instance of NodejsNode asynchronously
 * @param networkOpts
 * @param peerStoreDir
 */
export declare function createNodeJsLibp2p(peerIdOrPromise: PeerId | Promise<PeerId>, networkOpts?: Partial<INetworkOptions>, nodeJsLibp2pOpts?: NodeJsLibp2pOpts): Promise<LibP2p>;
//# sourceMappingURL=util.d.ts.map