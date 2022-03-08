"use strict";
/**
 * @module network/nodejs
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNodeJsLibp2p = void 0;
const bundle_1 = require("./bundle");
const options_1 = require("../options");
const __1 = require("..");
const discv5_1 = require("@chainsafe/discv5");
const datastore_level_1 = __importDefault(require("datastore-level"));
/**
 *
 * @param peerIdOrPromise Create an instance of NodejsNode asynchronously
 * @param networkOpts
 * @param peerStoreDir
 */
async function createNodeJsLibp2p(peerIdOrPromise, networkOpts = {}, nodeJsLibp2pOpts = {}) {
    var _a;
    const peerId = await Promise.resolve(peerIdOrPromise);
    const localMultiaddrs = networkOpts.localMultiaddrs || options_1.defaultNetworkOptions.localMultiaddrs;
    const bootMultiaddrs = networkOpts.bootMultiaddrs || options_1.defaultNetworkOptions.bootMultiaddrs;
    const enr = (_a = networkOpts.discv5) === null || _a === void 0 ? void 0 : _a.enr;
    const { peerStoreDir, disablePeerDiscovery } = nodeJsLibp2pOpts;
    if (enr !== undefined && typeof enr !== "string") {
        if (enr instanceof discv5_1.ENR) {
            if (enr.getLocationMultiaddr("udp") && !(0, __1.isLocalMultiAddr)(enr.getLocationMultiaddr("udp"))) {
                (0, __1.clearMultiaddrUDP)(enr);
            }
        }
        else {
            throw Error("network.discv5.enr must be an instance of ENR");
        }
    }
    let datastore = undefined;
    if (peerStoreDir) {
        datastore = new datastore_level_1.default(peerStoreDir);
        await datastore.open();
    }
    // Append discv5.bootEnrs to bootMultiaddrs if requested
    if (networkOpts.connectToDiscv5Bootnodes) {
        if (!networkOpts.bootMultiaddrs) {
            networkOpts.bootMultiaddrs = [];
        }
        if (!networkOpts.discv5) {
            networkOpts.discv5 = options_1.defaultDiscv5Options;
        }
        for (const enrOrStr of networkOpts.discv5.bootEnrs) {
            const enr = typeof enrOrStr === "string" ? discv5_1.ENR.decodeTxt(enrOrStr) : enrOrStr;
            const fullMultiAddr = await enr.getFullMultiaddr("tcp");
            const multiaddrWithPeerId = fullMultiAddr === null || fullMultiAddr === void 0 ? void 0 : fullMultiAddr.toString();
            if (multiaddrWithPeerId) {
                networkOpts.bootMultiaddrs.push(multiaddrWithPeerId);
            }
        }
    }
    return new bundle_1.NodejsNode({
        peerId,
        addresses: { listen: localMultiaddrs },
        datastore,
        bootMultiaddrs: bootMultiaddrs,
        maxConnections: networkOpts.maxPeers,
        minConnections: networkOpts.targetPeers,
        // If peer discovery is enabled let the default in NodejsNode
        peerDiscovery: disablePeerDiscovery ? [] : undefined,
    });
}
exports.createNodeJsLibp2p = createNodeJsLibp2p;
//# sourceMappingURL=util.js.map