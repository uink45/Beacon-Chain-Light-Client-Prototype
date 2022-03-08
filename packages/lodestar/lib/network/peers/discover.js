"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerDiscovery = void 0;
const multiaddr_1 = require("multiaddr");
const node_crypto_1 = __importDefault(require("node:crypto"));
const discv5_1 = require("@chainsafe/discv5");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const metadata_1 = require("../metadata");
const util_1 = require("../util");
const score_1 = require("./score");
const map_1 = require("../../util/map");
const enrSubnetsDeserialize_1 = require("./utils/enrSubnetsDeserialize");
/** Max number of cached ENRs after discovering a good peer */
const MAX_CACHED_ENRS = 100;
/** Max age a cached ENR will be considered for dial */
const MAX_CACHED_ENR_AGE_MS = 5 * 60 * 1000;
var QueryStatusCode;
(function (QueryStatusCode) {
    QueryStatusCode[QueryStatusCode["NotActive"] = 0] = "NotActive";
    QueryStatusCode[QueryStatusCode["Active"] = 1] = "Active";
})(QueryStatusCode || (QueryStatusCode = {}));
var DiscoveredPeerStatus;
(function (DiscoveredPeerStatus) {
    DiscoveredPeerStatus["no_tcp"] = "no_tcp";
    DiscoveredPeerStatus["no_eth2"] = "no_eth2";
    DiscoveredPeerStatus["unknown_forkDigest"] = "unknown_forkDigest";
    DiscoveredPeerStatus["bad_score"] = "bad_score";
    DiscoveredPeerStatus["already_connected"] = "already_connected";
    DiscoveredPeerStatus["error"] = "error";
    DiscoveredPeerStatus["attempt_dial"] = "attempt_dial";
    DiscoveredPeerStatus["cached"] = "cached";
    DiscoveredPeerStatus["dropped"] = "dropped";
})(DiscoveredPeerStatus || (DiscoveredPeerStatus = {}));
/**
 * PeerDiscovery discovers and dials new peers, and executes discv5 queries.
 * Currently relies on discv5 automatic periodic queries.
 */
class PeerDiscovery {
    constructor(modules, opts) {
        var _a;
        this.cachedENRs = new Set();
        this.randomNodeQuery = { code: QueryStatusCode.NotActive };
        this.peersToConnect = 0;
        this.subnetRequests = {
            attnets: new Map(),
            syncnets: new Map([[10, Date.now() + 2 * 60 * 60 * 1000]]),
        };
        this.connectToDiscv5BootnodesOnStart = false;
        /**
         * Progressively called by discv5 as a result of any query.
         */
        this.onDiscovered = async (enr) => {
            var _a;
            const status = await this.handleDiscoveredPeer(enr);
            (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.discovery.discoveredStatus.inc({ status });
        };
        const { libp2p, peerRpcScores, metrics, logger, config } = modules;
        this.libp2p = libp2p;
        this.peerRpcScores = peerRpcScores;
        this.metrics = metrics;
        this.logger = logger;
        this.config = config;
        this.maxPeers = opts.maxPeers;
        this.discv5StartMs = 0;
        this.discv5FirstQueryDelayMs = opts.discv5FirstQueryDelayMs;
        this.connectToDiscv5BootnodesOnStart = opts.connectToDiscv5Bootnodes;
        this.discv5 = discv5_1.Discv5.create({
            enr: opts.discv5.enr,
            peerId: modules.libp2p.peerId,
            multiaddr: new multiaddr_1.Multiaddr(opts.discv5.bindAddr),
            config: opts.discv5,
            // TODO: IDiscv5Metrics is not properly defined, should remove the collect() function
            metrics: (_a = modules.metrics) === null || _a === void 0 ? void 0 : _a.discv5,
        });
        opts.discv5.bootEnrs.forEach((bootEnr) => this.discv5.addEnr(bootEnr));
        if (metrics) {
            metrics.discovery.cachedENRsSize.addCollect(() => {
                metrics.discovery.cachedENRsSize.set(this.cachedENRs.size);
                metrics.discovery.peersToConnect.set(this.peersToConnect);
            });
        }
    }
    async start() {
        await this.discv5.start();
        this.discv5StartMs = Date.now();
        this.discv5.on("discovered", this.onDiscovered);
        if (this.connectToDiscv5BootnodesOnStart) {
            // In devnet scenarios, especially, we want more control over which peers we connect to.
            // Only dial the discv5.bootEnrs if the option
            // network.connectToDiscv5Bootnodes has been set to true.
            this.discv5.kadValues().forEach((enr) => this.onDiscovered(enr));
        }
    }
    async stop() {
        this.discv5.off("discovered", this.onDiscovered);
        await this.discv5.stop();
    }
    /**
     * Request to find peers, both on specific subnets and in general
     */
    discoverPeers(peersToConnect, subnetRequests = []) {
        const subnetsToDiscoverPeers = [];
        const cachedENRsToDial = new Set();
        // Iterate in reverse to consider first the most recent ENRs
        const cachedENRsReverse = [];
        for (const cachedENR of this.cachedENRs) {
            if (Date.now() - cachedENR.addedUnixMs > MAX_CACHED_ENR_AGE_MS) {
                this.cachedENRs.delete(cachedENR);
            }
            else {
                cachedENRsReverse.unshift(cachedENR);
            }
        }
        this.peersToConnect += peersToConnect;
        subnet: for (const subnetRequest of subnetRequests) {
            // Extend the toUnixMs for this subnet
            const prevUnixMs = this.subnetRequests[subnetRequest.type].get(subnetRequest.subnet);
            if (prevUnixMs === undefined || prevUnixMs < subnetRequest.toUnixMs) {
                this.subnetRequests[subnetRequest.type].set(subnetRequest.subnet, subnetRequest.toUnixMs);
            }
            // Get cached ENRs from the discovery service that are in the requested `subnetId`, but not connected yet
            let cachedENRsInSubnet = 0;
            for (const cachedENR of cachedENRsReverse) {
                if (cachedENR.subnets[subnetRequest.type][subnetRequest.subnet]) {
                    cachedENRsToDial.add(cachedENR);
                    if (++cachedENRsInSubnet >= subnetRequest.maxPeersToDiscover) {
                        continue subnet;
                    }
                }
            }
            // Query a discv5 query if more peers are needed
            subnetsToDiscoverPeers.push(subnetRequest);
        }
        // If subnetRequests won't connect enough peers for peersToConnect, add more
        if (cachedENRsToDial.size < peersToConnect) {
            for (const cachedENR of cachedENRsReverse) {
                cachedENRsToDial.add(cachedENR);
                if (cachedENRsToDial.size >= peersToConnect) {
                    break;
                }
            }
        }
        // Queue an outgoing connection request to the cached peers that are on `s.subnet_id`.
        // If we connect to the cached peers before the discovery query starts, then we potentially
        // save a costly discovery query.
        for (const cachedENRToDial of cachedENRsToDial) {
            this.cachedENRs.delete(cachedENRToDial);
            void this.dialPeer(cachedENRToDial);
        }
        // Run a discv5 subnet query to try to discover new peers
        if (subnetsToDiscoverPeers.length > 0 || cachedENRsToDial.size < peersToConnect) {
            void this.runFindRandomNodeQuery();
        }
    }
    /**
     * Request to find peers. First, looked at cached peers in peerStore
     */
    async runFindRandomNodeQuery() {
        var _a, _b, _c, _d;
        // Delay the 1st query after starting discv5
        // See https://github.com/ChainSafe/lodestar/issues/3423
        if (Date.now() - this.discv5StartMs <= this.discv5FirstQueryDelayMs) {
            return;
        }
        // Run a general discv5 query if one is not already in progress
        if (this.randomNodeQuery.code === QueryStatusCode.Active) {
            (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.discovery.findNodeQueryRequests.inc({ action: "ignore" });
            return;
        }
        else {
            (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.discovery.findNodeQueryRequests.inc({ action: "start" });
        }
        const randomNodeId = node_crypto_1.default.randomBytes(64).toString("hex");
        this.randomNodeQuery = { code: QueryStatusCode.Active, count: 0 };
        const timer = (_c = this.metrics) === null || _c === void 0 ? void 0 : _c.discovery.findNodeQueryTime.startTimer();
        try {
            const enrs = await this.discv5.findNode(randomNodeId);
            (_d = this.metrics) === null || _d === void 0 ? void 0 : _d.discovery.findNodeQueryEnrCount.inc(enrs.length);
        }
        catch (e) {
            this.logger.error("Error on discv5.findNode()", {}, e);
        }
        finally {
            this.randomNodeQuery = { code: QueryStatusCode.NotActive };
            timer === null || timer === void 0 ? void 0 : timer();
        }
    }
    /**
     * Progressively called by discv5 as a result of any query.
     */
    async handleDiscoveredPeer(enr) {
        try {
            if (this.randomNodeQuery.code === QueryStatusCode.Active) {
                this.randomNodeQuery.count++;
            }
            // We are not interested in peers that don't advertise their tcp addr
            const multiaddrTCP = enr.getLocationMultiaddr(metadata_1.ENRKey.tcp);
            if (!multiaddrTCP) {
                return DiscoveredPeerStatus.no_tcp;
            }
            // Check if the ENR.eth2 field matches and is of interest
            const eth2 = enr.get(metadata_1.ENRKey.eth2);
            if (!eth2) {
                return DiscoveredPeerStatus.no_eth2;
            }
            // Fast de-serialization without SSZ
            const forkDigest = eth2.slice(0, 4);
            // Check if forkDigest matches any of our known forks.
            const forkName = this.config.forkDigest2ForkNameOption(forkDigest);
            if (!forkName) {
                return DiscoveredPeerStatus.unknown_forkDigest;
            }
            // TODO: Then check if the next fork info matches ours
            // const enrForkId = ssz.phase0.ENRForkID.deserialize(eth2);
            // async due to some crypto that's no longer necessary
            const peerId = await enr.peerId();
            // Check if peer is not banned or disconnected
            if (this.peerRpcScores.getScoreState(peerId) !== score_1.ScoreState.Healthy) {
                return DiscoveredPeerStatus.bad_score;
            }
            // Ignore connected peers. TODO: Is this check necessary?
            if (this.isPeerConnected(peerId.toB58String())) {
                return DiscoveredPeerStatus.already_connected;
            }
            // Are this fields mandatory?
            const attnetsBytes = enr.get(metadata_1.ENRKey.attnets); // 64 bits
            const syncnetsBytes = enr.get(metadata_1.ENRKey.syncnets); // 4 bits
            // Use faster version than ssz's implementation that leverages pre-cached.
            // Some nodes don't serialize the bitfields properly, encoding the syncnets as attnets,
            // which cause the ssz implementation to throw on validation. deserializeEnrSubnets() will
            // never throw and treat too long or too short bitfields as zero-ed
            const attnets = attnetsBytes ? (0, enrSubnetsDeserialize_1.deserializeEnrSubnets)(attnetsBytes, lodestar_params_1.ATTESTATION_SUBNET_COUNT) : enrSubnetsDeserialize_1.zeroAttnets;
            const syncnets = syncnetsBytes ? (0, enrSubnetsDeserialize_1.deserializeEnrSubnets)(syncnetsBytes, lodestar_params_1.SYNC_COMMITTEE_SUBNET_COUNT) : enrSubnetsDeserialize_1.zeroSyncnets;
            // Should dial peer?
            const cachedPeer = {
                peerId,
                multiaddrTCP,
                subnets: { attnets, syncnets },
                addedUnixMs: Date.now(),
            };
            // Only dial peer if necessary
            if (this.shouldDialPeer(cachedPeer)) {
                void this.dialPeer(cachedPeer);
                return DiscoveredPeerStatus.attempt_dial;
            }
            else {
                // Add to pending good peers with a last seen time
                this.cachedENRs.add(cachedPeer);
                const dropped = (0, map_1.pruneSetToMax)(this.cachedENRs, MAX_CACHED_ENRS);
                // If the cache was already full, count the peer as dropped
                return dropped > 0 ? DiscoveredPeerStatus.dropped : DiscoveredPeerStatus.cached;
            }
        }
        catch (e) {
            this.logger.error("Error onDiscovered", {}, e);
            return DiscoveredPeerStatus.error;
        }
    }
    shouldDialPeer(peer) {
        if (this.peersToConnect > 0) {
            return true;
        }
        for (const type of [metadata_1.SubnetType.attnets, metadata_1.SubnetType.syncnets]) {
            for (const [subnet, toUnixMs] of this.subnetRequests[type].entries()) {
                if (toUnixMs < Date.now()) {
                    // Prune all requests
                    this.subnetRequests[type].delete(subnet);
                }
                else {
                    if (peer.subnets[type][subnet]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    /**
     * Handles DiscoveryEvent::QueryResult
     * Peers that have been returned by discovery requests are dialed here if they are suitable.
     */
    async dialPeer(cachedPeer) {
        var _a, _b;
        this.peersToConnect--;
        const { peerId, multiaddrTCP } = cachedPeer;
        // Must add the multiaddrs array to the address book before dialing
        // https://github.com/libp2p/js-libp2p/blob/aec8e3d3bb1b245051b60c2a890550d262d5b062/src/index.js#L638
        this.libp2p.peerStore.addressBook.add(peerId, [multiaddrTCP]);
        // Note: PeerDiscovery adds the multiaddrTCP beforehand
        const peerIdShort = (0, util_1.prettyPrintPeerId)(peerId);
        this.logger.debug("Dialing discovered peer", { peer: peerIdShort });
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.discovery.dialAttempts.inc();
        const timer = (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.discovery.dialTime.startTimer();
        // Note: `libp2p.dial()` is what libp2p.connectionManager autoDial calls
        // Note: You must listen to the connected events to listen for a successful conn upgrade
        try {
            await this.libp2p.dial(peerId);
            timer === null || timer === void 0 ? void 0 : timer({ status: "success" });
            this.logger.debug("Dialed discovered peer", { peer: peerIdShort });
        }
        catch (e) {
            timer === null || timer === void 0 ? void 0 : timer({ status: "error" });
            formatLibp2pDialError(e);
            this.logger.debug("Error dialing discovered peer", { peer: peerIdShort }, e);
        }
    }
    /** Check if there is 1+ open connection with this peer */
    isPeerConnected(peerIdStr) {
        const connections = this.libp2p.connectionManager.connections.get(peerIdStr);
        return Boolean(connections && connections.some((connection) => connection.stat.status === "open"));
    }
}
exports.PeerDiscovery = PeerDiscovery;
/**
 * libp2p errors with extremely noisy errors here, which are deeply nested taking 30-50 lines.
 * Some known erors:
 * ```
 * Error: The operation was aborted
 * Error: stream ended before 1 bytes became available
 * Error: Error occurred during XX handshake: Error occurred while verifying signed payload: Peer ID doesn't match libp2p public key
 * ```
 *
 * Also the error's message is not properly formated, where the error message in indentated and includes the full stack
 * ```
 * {
 *  emessage: '\n' +
 *    '    Error: stream ended before 1 bytes became available\n' +
 *    '        at /home/lion/Code/eth2.0/lodestar/node_modules/it-reader/index.js:37:9\n' +
 *    '        at runMicrotasks (<anonymous>)\n' +
 *    '        at decoder (/home/lion/Code/eth2.0/lodestar/node_modules/it-length-prefixed/src/decode.js:113:22)\n' +
 *    '        at first (/home/lion/Code/eth2.0/lodestar/node_modules/it-first/index.js:11:20)\n' +
 *    '        at Object.exports.read (/home/lion/Code/eth2.0/lodestar/node_modules/multistream-select/src/multistream.js:31:15)\n' +
 *    '        at module.exports (/home/lion/Code/eth2.0/lodestar/node_modules/multistream-select/src/select.js:21:19)\n' +
 *    '        at Upgrader._encryptOutbound (/home/lion/Code/eth2.0/lodestar/node_modules/libp2p/src/upgrader.js:397:36)\n' +
 *    '        at Upgrader.upgradeOutbound (/home/lion/Code/eth2.0/lodestar/node_modules/libp2p/src/upgrader.js:176:11)\n' +
 *    '        at ClassIsWrapper.dial (/home/lion/Code/eth2.0/lodestar/node_modules/libp2p-tcp/src/index.js:49:18)'
 * }
 * ```
 *
 * Tracking issue https://github.com/libp2p/js-libp2p/issues/996
 */
function formatLibp2pDialError(e) {
    const errorMessage = e.message.trim();
    e.message = errorMessage.slice(0, errorMessage.indexOf("\n"));
    if (e.message.includes("The operation was aborted") ||
        e.message.includes("stream ended before 1 bytes became available") ||
        e.message.includes("The operation was aborted")) {
        e.stack === undefined;
    }
}
//# sourceMappingURL=discover.js.map