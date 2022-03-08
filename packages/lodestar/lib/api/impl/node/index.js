"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodeApi = void 0;
const lodestar_api_1 = require("@chainsafe/lodestar-api");
const discv5_1 = require("@chainsafe/discv5");
const utils_1 = require("./utils");
const errors_1 = require("../errors");
function getNodeApi(opts, { network, sync }) {
    return {
        async getNetworkIdentity() {
            var _a, _b, _c, _d;
            const enr = network.getEnr();
            const keypair = (0, discv5_1.createKeypairFromPeerId)(network.peerId);
            const discoveryAddresses = [
                (_b = (_a = enr === null || enr === void 0 ? void 0 : enr.getLocationMultiaddr("tcp")) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : null,
                (_d = (_c = enr === null || enr === void 0 ? void 0 : enr.getLocationMultiaddr("udp")) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : null,
            ].filter((addr) => Boolean(addr));
            return {
                data: {
                    peerId: network.peerId.toB58String(),
                    enr: (enr === null || enr === void 0 ? void 0 : enr.encodeTxt(keypair.privateKey)) || "",
                    discoveryAddresses,
                    p2pAddresses: network.localMultiaddrs.map((m) => m.toString()),
                    metadata: network.metadata,
                },
            };
        },
        async getPeer(peerIdStr) {
            const connections = network.getConnectionsByPeer().get(peerIdStr);
            if (!connections) {
                throw new errors_1.ApiError(404, "Node has not seen this peer");
            }
            return { data: (0, utils_1.formatNodePeer)(peerIdStr, connections) };
        },
        async getPeers(filters) {
            const { state, direction } = filters || {};
            const peers = Array.from(network.getConnectionsByPeer().entries())
                .map(([peerIdStr, connections]) => (0, utils_1.formatNodePeer)(peerIdStr, connections))
                .filter((nodePeer) => (!state || state.length === 0 || state.includes(nodePeer.state)) &&
                (!direction || direction.length === 0 || (nodePeer.direction && direction.includes(nodePeer.direction))));
            return {
                data: peers,
                meta: { count: peers.length },
            };
        },
        async getPeerCount() {
            // TODO: Implement
            return {
                data: {
                    disconnected: 0,
                    connecting: 0,
                    connected: 0,
                    disconnecting: 0,
                },
            };
        },
        async getNodeVersion() {
            return {
                data: {
                    version: `Lodestar/${opts.version || "dev"}`,
                },
            };
        },
        async getSyncingStatus() {
            return { data: sync.getSyncStatus() };
        },
        async getHealth() {
            if (sync.getSyncStatus().isSyncing) {
                // 200: Node is ready
                return lodestar_api_1.routes.node.NodeHealth.SYNCING;
            }
            else {
                // 206: Node is syncing but can serve incomplete data
                return lodestar_api_1.routes.node.NodeHealth.READY;
            }
            // else {
            //   503: Node not initialized or having issues
            //   NOTE: Lodestar does not start its API until fully initialized, so this status can never be served
            // }
        },
    };
}
exports.getNodeApi = getNodeApi;
//# sourceMappingURL=index.js.map