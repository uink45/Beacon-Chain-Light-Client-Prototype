"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerManager = void 0;
const constants_1 = require("../../constants");
const events_1 = require("../events");
const reqresp_1 = require("../reqresp");
const util_1 = require("../util");
const discover_1 = require("./discover");
const score_1 = require("./score");
const utils_1 = require("./utils");
const metadata_1 = require("../metadata");
/** heartbeat performs regular updates such as updating reputations and performing discovery requests */
const HEARTBEAT_INTERVAL_MS = 30 * 1000;
/** The time in seconds between PING events. We do not send a ping if the other peer has PING'd us */
const PING_INTERVAL_INBOUND_MS = 4 * 60 * 1000 - 11 * 1000; // Offset to not ping when outbound reqs
const PING_INTERVAL_OUTBOUND_MS = 4 * 60 * 1000;
/** The time in seconds between re-status's peers. */
const STATUS_INTERVAL_MS = 5 * 60 * 1000;
/** Expect a STATUS request from on inbound peer for some time. Afterwards the node does a request */
const STATUS_INBOUND_GRACE_PERIOD = 15 * 1000;
/** Internal interval to check PING and STATUS timeouts */
const CHECK_PING_STATUS_INTERVAL = 10 * 1000;
var RelevantPeerStatus;
(function (RelevantPeerStatus) {
    RelevantPeerStatus["Unknown"] = "unknown";
    RelevantPeerStatus["relevant"] = "relevant";
    RelevantPeerStatus["irrelevant"] = "irrelevant";
})(RelevantPeerStatus || (RelevantPeerStatus = {}));
/**
 * Performs all peer managment functionality in a single grouped class:
 * - Ping peers every `PING_INTERVAL_MS`
 * - Status peers every `STATUS_INTERVAL_MS`
 * - Execute discovery query if under target peers
 * - Execute discovery query if need peers on some subnet: TODO
 * - Disconnect peers if over target peers
 */
class PeerManager {
    constructor(modules, opts) {
        // A single map of connected peers with all necessary data to handle PINGs, STATUS, and metrics
        this.connectedPeers = new Map();
        this.intervals = [];
        /**
         * Must be called when network ReqResp receives incoming requests
         */
        this.onRequest = (request, peer) => {
            try {
                const peerData = this.connectedPeers.get(peer.toB58String());
                if (peerData) {
                    peerData.lastReceivedMsgUnixTsMs = Date.now();
                }
                switch (request.method) {
                    case reqresp_1.ReqRespMethod.Ping:
                        return this.onPing(peer, request.body);
                    case reqresp_1.ReqRespMethod.Goodbye:
                        return this.onGoodbye(peer, request.body);
                    case reqresp_1.ReqRespMethod.Status:
                        return this.onStatus(peer, request.body);
                }
            }
            catch (e) {
                this.logger.error("Error onRequest handler", {}, e);
            }
        };
        /**
         * The libp2p Upgrader has successfully upgraded a peer connection on a particular multiaddress
         * This event is routed through the connectionManager
         *
         * Registers a peer as connected. The `direction` parameter determines if the peer is being
         * dialed or connecting to us.
         */
        this.onLibp2pPeerConnect = (libp2pConnection) => {
            var _a;
            const { direction, status } = libp2pConnection.stat;
            const peer = libp2pConnection.remotePeer;
            if (!this.connectedPeers.has(peer.toB58String())) {
                // On connection:
                // - Outbound connections: send a STATUS and PING request
                // - Inbound connections: expect to be STATUS'd, schedule STATUS and PING for latter
                // NOTE: libp2p may emit two "peer:connect" events: One for inbound, one for outbound
                // If that happens, it's okay. Only the "outbound" connection triggers immediate action
                const now = Date.now();
                this.connectedPeers.set(peer.toB58String(), {
                    lastReceivedMsgUnixTsMs: direction === "outbound" ? 0 : now,
                    // If inbound, request after STATUS_INBOUND_GRACE_PERIOD
                    lastStatusUnixTsMs: direction === "outbound" ? 0 : now - STATUS_INTERVAL_MS + STATUS_INBOUND_GRACE_PERIOD,
                    connectedUnixTsMs: now,
                    relevantStatus: RelevantPeerStatus.Unknown,
                    direction,
                    peerId: peer,
                });
                if (direction === "outbound") {
                    this.pingAndStatusTimeouts();
                }
            }
            this.logger.verbose("peer connected", { peer: (0, util_1.prettyPrintPeerId)(peer), direction, status });
            // NOTE: The peerConnect event is not emitted here here, but after asserting peer relevance
            (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.peerConnectedEvent.inc({ direction });
        };
        /**
         * The libp2p Upgrader has ended a connection
         */
        this.onLibp2pPeerDisconnect = (libp2pConnection) => {
            var _a;
            const { direction, status } = libp2pConnection.stat;
            const peer = libp2pConnection.remotePeer;
            // remove the ping and status timer for the peer
            this.connectedPeers.delete(peer.toB58String());
            this.logger.verbose("peer disconnected", { peer: (0, util_1.prettyPrintPeerId)(peer), direction, status });
            this.networkEventBus.emit(events_1.NetworkEvent.peerDisconnected, peer);
            this.reqResp.pruneRateLimiterData(peer);
            (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.peerDisconnectedEvent.inc({ direction });
        };
        this.libp2p = modules.libp2p;
        this.logger = modules.logger;
        this.metrics = modules.metrics;
        this.reqResp = modules.reqResp;
        this.attnetsService = modules.attnetsService;
        this.syncnetsService = modules.syncnetsService;
        this.chain = modules.chain;
        this.config = modules.config;
        this.peerMetadata = modules.peerMetadata;
        this.peerRpcScores = modules.peerRpcScores;
        this.networkEventBus = modules.networkEventBus;
        this.opts = opts;
        // opts.discv5 === null, discovery is disabled
        this.discovery =
            opts.discv5 &&
                new discover_1.PeerDiscovery(modules, {
                    maxPeers: opts.maxPeers,
                    discv5FirstQueryDelayMs: opts.discv5FirstQueryDelayMs,
                    discv5: opts.discv5,
                    connectToDiscv5Bootnodes: opts.connectToDiscv5Bootnodes,
                });
        const { metrics } = modules;
        if (metrics) {
            metrics.peers.addCollect(() => this.runPeerCountMetrics(metrics));
        }
    }
    async start() {
        var _a;
        await ((_a = this.discovery) === null || _a === void 0 ? void 0 : _a.start());
        this.libp2p.connectionManager.on(constants_1.Libp2pEvent.peerConnect, this.onLibp2pPeerConnect);
        this.libp2p.connectionManager.on(constants_1.Libp2pEvent.peerDisconnect, this.onLibp2pPeerDisconnect);
        this.networkEventBus.on(events_1.NetworkEvent.reqRespRequest, this.onRequest);
        // On start-up will connected to existing peers in libp2p.peerStore, same as autoDial behaviour
        this.heartbeat();
        this.intervals = [
            setInterval(this.pingAndStatusTimeouts.bind(this), CHECK_PING_STATUS_INTERVAL),
            setInterval(this.heartbeat.bind(this), HEARTBEAT_INTERVAL_MS),
        ];
    }
    async stop() {
        var _a;
        await ((_a = this.discovery) === null || _a === void 0 ? void 0 : _a.stop());
        this.libp2p.connectionManager.removeListener(constants_1.Libp2pEvent.peerConnect, this.onLibp2pPeerConnect);
        this.libp2p.connectionManager.removeListener(constants_1.Libp2pEvent.peerDisconnect, this.onLibp2pPeerDisconnect);
        this.networkEventBus.off(events_1.NetworkEvent.reqRespRequest, this.onRequest);
        for (const interval of this.intervals)
            clearInterval(interval);
    }
    /**
     * Return peers with at least one connection in status "open"
     */
    getConnectedPeerIds() {
        return (0, utils_1.getConnectedPeerIds)(this.libp2p);
    }
    /**
     * Efficiently check if there is at least one peer connected
     */
    hasSomeConnectedPeer() {
        return (0, utils_1.hasSomeConnectedPeer)(this.libp2p);
    }
    async goodbyeAndDisconnectAllPeers() {
        await Promise.all(
        // Filter by peers that support the goodbye protocol: {supportsProtocols: [goodbyeProtocol]}
        this.getConnectedPeerIds().map(async (peer) => this.goodbyeAndDisconnect(peer, constants_1.GoodByeReasonCode.CLIENT_SHUTDOWN)));
    }
    /**
     * Run after validator subscriptions request.
     */
    onCommitteeSubscriptions() {
        // TODO:
        // Only if the slot is more than epoch away, add an event to start looking for peers
        // Request to run heartbeat fn
        this.heartbeat();
    }
    /**
     * The app layer needs to refresh the status of some peers. The sync have reached a target
     */
    reStatusPeers(peers) {
        for (const peer of peers) {
            const peerData = this.connectedPeers.get(peer.toB58String());
            if (peerData) {
                // Set to 0 to trigger a status request after calling pingAndStatusTimeouts()
                peerData.lastStatusUnixTsMs = 0;
            }
        }
        this.pingAndStatusTimeouts();
    }
    /**
     * Handle a PING request + response (rpc handler responds with PONG automatically)
     */
    onPing(peer, seqNumber) {
        // if the sequence number is unknown update the peer's metadata
        const metadata = this.peerMetadata.metadata.get(peer);
        if (!metadata || metadata.seqNumber < seqNumber) {
            void this.requestMetadata(peer);
        }
    }
    /**
     * Handle a METADATA request + response (rpc handler responds with METADATA automatically)
     */
    onMetadata(peer, metadata) {
        // Store metadata always in case the peer updates attnets but not the sequence number
        // Trust that the peer always sends the latest metadata (From Lighthouse)
        this.peerMetadata.metadata.set(peer, {
            ...metadata,
            syncnets: metadata.syncnets || [],
        });
    }
    /**
     * Handle a GOODBYE request (rpc handler responds automatically)
     */
    onGoodbye(peer, goodbye) {
        var _a;
        const reason = constants_1.GOODBYE_KNOWN_CODES[goodbye.toString()] || "";
        this.logger.verbose("Received goodbye request", { peer: (0, util_1.prettyPrintPeerId)(peer), goodbye, reason });
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.peerGoodbyeReceived.inc({ reason });
        // TODO: Consider register that we are banned, if discovery keeps attempting to connect to the same peers
        void this.disconnect(peer);
    }
    /**
     * Handle a STATUS request + response (rpc handler responds with STATUS automatically)
     */
    onStatus(peer, status) {
        // reset the to-status timer of this peer
        const peerData = this.connectedPeers.get(peer.toB58String());
        if (peerData)
            peerData.lastStatusUnixTsMs = Date.now();
        let isIrrelevant;
        try {
            const irrelevantReasonType = (0, utils_1.assertPeerRelevance)(status, this.chain);
            if (irrelevantReasonType === null) {
                isIrrelevant = false;
            }
            else {
                isIrrelevant = true;
                this.logger.debug("Irrelevant peer", {
                    peer: (0, util_1.prettyPrintPeerId)(peer),
                    reason: (0, utils_1.renderIrrelevantPeerType)(irrelevantReasonType),
                });
            }
        }
        catch (e) {
            this.logger.error("Irrelevant peer - unexpected error", { peer: (0, util_1.prettyPrintPeerId)(peer) }, e);
            isIrrelevant = true;
        }
        if (isIrrelevant) {
            if (peerData)
                peerData.relevantStatus = RelevantPeerStatus.irrelevant;
            void this.goodbyeAndDisconnect(peer, constants_1.GoodByeReasonCode.IRRELEVANT_NETWORK);
            return;
        }
        // Peer is usable, send it to the rangeSync
        // NOTE: Peer may not be connected anymore at this point, potential race condition
        // libp2p.connectionManager.get() returns not null if there's +1 open connections with `peer`
        if (peerData)
            peerData.relevantStatus = RelevantPeerStatus.relevant;
        if (this.libp2p.connectionManager.get(peer)) {
            this.networkEventBus.emit(events_1.NetworkEvent.peerConnected, peer, status);
        }
    }
    async requestMetadata(peer) {
        try {
            this.onMetadata(peer, await this.reqResp.metadata(peer));
        }
        catch (e) {
            // TODO: Downvote peer here or in the reqResp layer
        }
    }
    async requestPing(peer) {
        try {
            this.onPing(peer, await this.reqResp.ping(peer));
        }
        catch (e) {
            // TODO: Downvote peer here or in the reqResp layer
        }
    }
    async requestStatus(peer, localStatus) {
        try {
            this.onStatus(peer, await this.reqResp.status(peer, localStatus));
        }
        catch (e) {
            // TODO: Failed to get peer latest status: downvote but don't disconnect
        }
    }
    async requestStatusMany(peers) {
        try {
            const localStatus = this.chain.getStatus();
            await Promise.all(peers.map(async (peer) => this.requestStatus(peer, localStatus)));
        }
        catch (e) {
            this.logger.verbose("Error requesting new status to peers", {}, e);
        }
    }
    /**
     * The Peer manager's heartbeat maintains the peer count and maintains peer reputations.
     * It will request discovery queries if the peer count has not reached the desired number of peers.
     * NOTE: Discovery should only add a new query if one isn't already queued.
     */
    heartbeat() {
        var _a, _b, _c, _d;
        const connectedPeers = this.getConnectedPeerIds();
        // ban and disconnect peers with bad score, collect rest of healthy peers
        const connectedHealthyPeers = [];
        for (const peer of connectedPeers) {
            // to decay score
            this.peerRpcScores.update(peer);
            switch (this.peerRpcScores.getScoreState(peer)) {
                case score_1.ScoreState.Banned:
                    void this.goodbyeAndDisconnect(peer, constants_1.GoodByeReasonCode.BANNED);
                    break;
                case score_1.ScoreState.Disconnected:
                    void this.goodbyeAndDisconnect(peer, constants_1.GoodByeReasonCode.SCORE_TOO_LOW);
                    break;
                case score_1.ScoreState.Healthy:
                    connectedHealthyPeers.push(peer);
            }
        }
        const { peersToDisconnect, peersToConnect, attnetQueries, syncnetQueries } = (0, utils_1.prioritizePeers)(connectedHealthyPeers.map((peer) => {
            var _a, _b, _c, _d;
            return ({
                id: peer,
                attnets: (_b = (_a = this.peerMetadata.metadata.get(peer)) === null || _a === void 0 ? void 0 : _a.attnets) !== null && _b !== void 0 ? _b : [],
                syncnets: (_d = (_c = this.peerMetadata.metadata.get(peer)) === null || _c === void 0 ? void 0 : _c.syncnets) !== null && _d !== void 0 ? _d : [],
                score: this.peerRpcScores.getScore(peer),
            });
        }), 
        // Collect subnets which we need peers for in the current slot
        this.attnetsService.getActiveSubnets(), this.syncnetsService.getActiveSubnets(), this.opts);
        // Register results to metrics
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.peersRequestedToDisconnect.inc(peersToDisconnect.length);
        (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.peersRequestedToConnect.inc(peersToConnect);
        const queriesMerged = [];
        for (const { type, queries } of [
            { type: metadata_1.SubnetType.attnets, queries: attnetQueries },
            { type: metadata_1.SubnetType.syncnets, queries: syncnetQueries },
        ]) {
            if (queries.length > 0) {
                let count = 0;
                for (const query of queries) {
                    count += query.maxPeersToDiscover;
                    queriesMerged.push({
                        subnet: query.subnet,
                        type,
                        maxPeersToDiscover: query.maxPeersToDiscover,
                        toUnixMs: 1000 * (this.chain.genesisTime + query.toSlot * this.config.SECONDS_PER_SLOT),
                    });
                }
                (_c = this.metrics) === null || _c === void 0 ? void 0 : _c.peersRequestedSubnetsToQuery.inc({ type }, queries.length);
                (_d = this.metrics) === null || _d === void 0 ? void 0 : _d.peersRequestedSubnetsPeerCount.inc({ type }, count);
            }
        }
        if (this.discovery) {
            try {
                this.discovery.discoverPeers(peersToConnect, queriesMerged);
            }
            catch (e) {
                this.logger.error("Error on discoverPeers", {}, e);
            }
        }
        for (const peer of peersToDisconnect) {
            void this.goodbyeAndDisconnect(peer, constants_1.GoodByeReasonCode.TOO_MANY_PEERS);
        }
    }
    pingAndStatusTimeouts() {
        const now = Date.now();
        const peersToStatus = [];
        for (const peer of this.connectedPeers.values()) {
            // Every interval request to send some peers our seqNumber and process theirs
            // If the seqNumber is different it must request the new metadata
            const pingInterval = peer.direction === "inbound" ? PING_INTERVAL_INBOUND_MS : PING_INTERVAL_OUTBOUND_MS;
            if (now > peer.lastReceivedMsgUnixTsMs + pingInterval) {
                void this.requestPing(peer.peerId);
            }
            // TODO: Consider sending status request to peers that do support status protocol
            // {supportsProtocols: getStatusProtocols()}
            // Every interval request to send some peers our status, and process theirs
            // Must re-check if this peer is relevant to us and emit an event if the status changes
            // So the sync layer can update things
            if (now > peer.lastStatusUnixTsMs + STATUS_INTERVAL_MS) {
                peersToStatus.push(peer.peerId);
            }
        }
        if (peersToStatus.length > 0) {
            void this.requestStatusMany(peersToStatus);
        }
    }
    async disconnect(peer) {
        try {
            await this.libp2p.hangUp(peer);
        }
        catch (e) {
            this.logger.warn("Unclean disconnect", { peer: (0, util_1.prettyPrintPeerId)(peer) }, e);
        }
    }
    async goodbyeAndDisconnect(peer, goodbye) {
        var _a;
        try {
            (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.peerGoodbyeSent.inc({ reason: constants_1.GOODBYE_KNOWN_CODES[goodbye.toString()] || "" });
            await this.reqResp.goodbye(peer, BigInt(goodbye));
        }
        catch (e) {
            this.logger.verbose("Failed to send goodbye", { peer: (0, util_1.prettyPrintPeerId)(peer) }, e);
        }
        finally {
            void this.disconnect(peer);
        }
    }
    /** Register peer count metrics */
    runPeerCountMetrics(metrics) {
        var _a, _b;
        let total = 0;
        const peersByDirection = new Map();
        const peersByClient = new Map();
        for (const connections of this.libp2p.connectionManager.connections.values()) {
            const openCnx = connections.find((cnx) => cnx.stat.status === "open");
            if (openCnx) {
                const direction = openCnx.stat.direction;
                peersByDirection.set(direction, 1 + ((_a = peersByDirection.get(direction)) !== null && _a !== void 0 ? _a : 0));
                const client = (0, util_1.getClientFromPeerStore)(openCnx.remotePeer, this.libp2p.peerStore.metadataBook);
                peersByClient.set(client, 1 + ((_b = peersByClient.get(client)) !== null && _b !== void 0 ? _b : 0));
                total++;
            }
        }
        for (const [direction, peers] of peersByDirection.entries()) {
            metrics.peersByDirection.set({ direction }, peers);
        }
        for (const [client, peers] of peersByClient.entries()) {
            metrics.peersByClient.set({ client }, peers);
        }
        let syncPeers = 0;
        for (const peer of this.connectedPeers.values()) {
            if (peer.relevantStatus === RelevantPeerStatus.relevant) {
                syncPeers++;
            }
        }
        metrics.peers.set(total);
        metrics.peersSync.set(syncPeers);
    }
}
exports.PeerManager = PeerManager;
//# sourceMappingURL=peerManager.js.map