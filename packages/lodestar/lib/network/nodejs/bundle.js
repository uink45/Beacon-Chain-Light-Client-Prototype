"use strict";
/**
 * @module network/nodejs
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodejsNode = void 0;
const libp2p_1 = __importDefault(require("libp2p"));
const libp2p_tcp_1 = __importDefault(require("libp2p-tcp"));
const libp2p_mplex_1 = __importDefault(require("libp2p-mplex"));
const libp2p_noise_1 = require("@chainsafe/libp2p-noise");
const libp2p_bootstrap_1 = __importDefault(require("libp2p-bootstrap"));
const libp2p_mdns_1 = __importDefault(require("libp2p-mdns"));
class NodejsNode extends libp2p_1.default {
    constructor(options) {
        super({
            peerId: options.peerId,
            addresses: {
                listen: options.addresses.listen,
                announce: options.addresses.announce || [],
            },
            modules: {
                connEncryption: [libp2p_noise_1.NOISE],
                transport: [libp2p_tcp_1.default],
                streamMuxer: [libp2p_mplex_1.default],
                peerDiscovery: options.peerDiscovery || [libp2p_bootstrap_1.default, libp2p_mdns_1.default],
            },
            dialer: {
                maxParallelDials: 100,
                maxAddrsToDial: 4,
                maxDialsPerPeer: 2,
                dialTimeout: 30000,
            },
            connectionManager: {
                autoDial: false,
                // DOCS: the maximum number of connections libp2p is willing to have before it starts disconnecting.
                // If ConnectionManager.size > maxConnections calls _maybeDisconnectOne() which will sort peers disconnect
                // the one with the least `_peerValues`. That's a custom peer generalized score that's not used, so it always
                // has the same value in current Lodestar usage.
                maxConnections: options.maxConnections,
                // DOCS: the minimum number of connections below which libp2p not activate preemptive disconnections.
                // If ConnectionManager.size < minConnections, it won't prune peers in _maybeDisconnectOne(). If autoDial is
                // off it doesn't have any effect in behaviour.
                minConnections: options.minConnections,
            },
            datastore: options.datastore,
            peerStore: {
                persistence: !!options.datastore,
                threshold: 10,
            },
            config: {
                nat: {
                    // libp2p usage of nat-api is broken as shown in this issue. https://github.com/ChainSafe/lodestar/issues/2996
                    // Also, unnsolicited usage of UPnP is not great, and should be customizable with flags
                    enabled: false,
                },
                relay: {
                    enabled: false,
                    hop: {
                        enabled: false,
                        active: false,
                    },
                    advertise: {
                        enabled: false,
                        ttl: 0,
                        bootDelay: 0,
                    },
                    autoRelay: {
                        enabled: false,
                        maxListeners: 0,
                    },
                },
                peerDiscovery: {
                    autoDial: false,
                    mdns: {
                        peerId: options.peerId,
                    },
                    bootstrap: {
                        enabled: !!(options.bootMultiaddrs && options.bootMultiaddrs.length),
                        interval: 2000,
                        list: (options.bootMultiaddrs || []),
                    },
                },
            },
        });
    }
}
exports.NodejsNode = NodejsNode;
//# sourceMappingURL=bundle.js.map