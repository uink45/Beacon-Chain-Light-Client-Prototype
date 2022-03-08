"use strict";
/**
 * @module network
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const chain_1 = require("../chain");
const reqresp_1 = require("./reqresp");
const gossip_1 = require("./gossip");
const metadata_1 = require("./metadata");
const forks_1 = require("./forks");
const metastore_1 = require("./peers/metastore");
const peerManager_1 = require("./peers/peerManager");
const peers_1 = require("./peers");
const events_1 = require("./events");
const subnets_1 = require("./subnets");
class Network {
    constructor(opts, modules) {
        this.opts = opts;
        this.subscribedForks = new Set();
        /**
         * Handle subscriptions through fork transitions, @see FORK_EPOCH_LOOKAHEAD
         */
        this.onEpoch = (epoch) => {
            try {
                // Compute prev and next fork shifted, so next fork is still next at forkEpoch + FORK_EPOCH_LOOKAHEAD
                const activeForks = (0, forks_1.getActiveForks)(this.config, epoch);
                for (let i = 0; i < activeForks.length; i++) {
                    // Only when a new fork is scheduled post this one
                    if (activeForks[i + 1]) {
                        const prevFork = activeForks[i];
                        const nextFork = activeForks[i + 1];
                        const forkEpoch = this.config.forks[nextFork].epoch;
                        // Before fork transition
                        if (epoch === forkEpoch - forks_1.FORK_EPOCH_LOOKAHEAD) {
                            this.logger.info("Subscribing gossip topics to next fork", { nextFork });
                            // Don't subscribe to new fork if the node is not subscribed to any topic
                            if (this.isSubscribedToGossipCoreTopics())
                                this.subscribeCoreTopicsAtFork(nextFork);
                            this.attnetsService.subscribeSubnetsToNextFork(nextFork);
                            this.syncnetsService.subscribeSubnetsToNextFork(nextFork);
                        }
                        // On fork transition
                        if (epoch === forkEpoch) {
                            // updateEth2Field() MUST be called with clock epoch, onEpoch event is emitted in response to clock events
                            this.metadata.updateEth2Field(epoch);
                        }
                        // After fork transition
                        if (epoch === forkEpoch + forks_1.FORK_EPOCH_LOOKAHEAD) {
                            this.logger.info("Unsubscribing gossip topics from prev fork", { prevFork });
                            this.unsubscribeCoreTopicsAtFork(prevFork);
                            this.attnetsService.unsubscribeSubnetsFromPrevFork(prevFork);
                            this.syncnetsService.unsubscribeSubnetsFromPrevFork(prevFork);
                        }
                    }
                }
            }
            catch (e) {
                this.logger.error("Error on BeaconGossipHandler.onEpoch", { epoch }, e);
            }
        };
        this.subscribeCoreTopicsAtFork = (fork) => {
            if (this.subscribedForks.has(fork))
                return;
            this.subscribedForks.add(fork);
            this.gossip.subscribeTopic({ type: gossip_1.GossipType.beacon_block, fork });
            this.gossip.subscribeTopic({ type: gossip_1.GossipType.beacon_aggregate_and_proof, fork });
            this.gossip.subscribeTopic({ type: gossip_1.GossipType.voluntary_exit, fork });
            this.gossip.subscribeTopic({ type: gossip_1.GossipType.proposer_slashing, fork });
            this.gossip.subscribeTopic({ type: gossip_1.GossipType.attester_slashing, fork });
            // Any fork after altair included
            if (fork !== lodestar_params_1.ForkName.phase0) {
                this.gossip.subscribeTopic({ type: gossip_1.GossipType.sync_committee_contribution_and_proof, fork });
            }
            if (this.opts.subscribeAllSubnets) {
                for (let subnet = 0; subnet < lodestar_params_1.ATTESTATION_SUBNET_COUNT; subnet++) {
                    this.gossip.subscribeTopic({ type: gossip_1.GossipType.beacon_attestation, fork, subnet });
                }
                for (let subnet = 0; subnet < lodestar_params_1.SYNC_COMMITTEE_SUBNET_COUNT; subnet++) {
                    this.gossip.subscribeTopic({ type: gossip_1.GossipType.sync_committee, fork, subnet });
                }
            }
        };
        this.unsubscribeCoreTopicsAtFork = (fork) => {
            if (!this.subscribedForks.has(fork))
                return;
            this.subscribedForks.delete(fork);
            this.gossip.unsubscribeTopic({ type: gossip_1.GossipType.beacon_block, fork });
            this.gossip.unsubscribeTopic({ type: gossip_1.GossipType.beacon_aggregate_and_proof, fork });
            this.gossip.unsubscribeTopic({ type: gossip_1.GossipType.voluntary_exit, fork });
            this.gossip.unsubscribeTopic({ type: gossip_1.GossipType.proposer_slashing, fork });
            this.gossip.unsubscribeTopic({ type: gossip_1.GossipType.attester_slashing, fork });
            // Any fork after altair included
            if (fork !== lodestar_params_1.ForkName.phase0) {
                this.gossip.unsubscribeTopic({ type: gossip_1.GossipType.sync_committee_contribution_and_proof, fork });
            }
            if (this.opts.subscribeAllSubnets) {
                for (let subnet = 0; subnet < lodestar_params_1.ATTESTATION_SUBNET_COUNT; subnet++) {
                    this.gossip.unsubscribeTopic({ type: gossip_1.GossipType.beacon_attestation, fork, subnet });
                }
                for (let subnet = 0; subnet < lodestar_params_1.SYNC_COMMITTEE_SUBNET_COUNT; subnet++) {
                    this.gossip.unsubscribeTopic({ type: gossip_1.GossipType.sync_committee, fork, subnet });
                }
            }
        };
        const { config, libp2p, logger, metrics, chain, reqRespHandlers, gossipHandlers, signal } = modules;
        this.libp2p = libp2p;
        this.logger = logger;
        this.config = config;
        this.clock = chain.clock;
        this.chain = chain;
        const networkEventBus = new events_1.NetworkEventBus();
        const metadata = new metadata_1.MetadataController({}, { config, chain, logger });
        const peerMetadata = new metastore_1.Libp2pPeerMetadataStore(libp2p.peerStore.metadataBook);
        const peerRpcScores = new peers_1.PeerRpcScoreStore(peerMetadata);
        this.events = networkEventBus;
        this.metadata = metadata;
        this.peerRpcScores = peerRpcScores;
        this.peerMetadata = peerMetadata;
        this.reqResp = new reqresp_1.ReqResp({
            config,
            libp2p,
            reqRespHandlers,
            peerMetadata,
            metadata,
            peerRpcScores,
            logger,
            networkEventBus,
            metrics,
        }, opts);
        this.gossip = new gossip_1.Eth2Gossipsub({
            config,
            libp2p,
            logger,
            peerRpcScores,
            metrics,
            signal,
            gossipHandlers: gossipHandlers !== null && gossipHandlers !== void 0 ? gossipHandlers : (0, gossip_1.getGossipHandlers)({ chain, config, logger, network: this, metrics }, opts),
            eth2Context: {
                activeValidatorCount: chain.getHeadState().currentShuffling.activeIndices.length,
                currentSlot: this.clock.currentSlot,
                currentEpoch: this.clock.currentEpoch,
            },
        });
        this.attnetsService = new subnets_1.AttnetsService(config, chain, this.gossip, metadata, logger, opts);
        this.syncnetsService = new subnets_1.SyncnetsService(config, chain, this.gossip, metadata, logger, opts);
        this.peerManager = new peerManager_1.PeerManager({
            libp2p,
            reqResp: this.reqResp,
            attnetsService: this.attnetsService,
            syncnetsService: this.syncnetsService,
            logger,
            metrics,
            chain,
            config,
            peerMetadata,
            peerRpcScores,
            networkEventBus,
        }, opts);
        this.chain.emitter.on(chain_1.ChainEvent.clockEpoch, this.onEpoch);
        modules.signal.addEventListener("abort", this.close.bind(this), { once: true });
    }
    /** Destroy this instance. Can only be called once. */
    close() {
        this.chain.emitter.off(chain_1.ChainEvent.clockEpoch, this.onEpoch);
    }
    async start() {
        await this.libp2p.start();
        // Stop latency monitor since we handle disconnects here and don't want additional load on the event loop
        this.libp2p.connectionManager._latencyMonitor.stop();
        this.reqResp.start();
        this.metadata.start(this.getEnr(), this.config.getForkName(this.clock.currentSlot));
        await this.peerManager.start();
        this.gossip.start();
        this.attnetsService.start();
        this.syncnetsService.start();
        const multiaddresses = this.libp2p.multiaddrs.map((m) => m.toString()).join(",");
        this.logger.info(`PeerId ${this.libp2p.peerId.toB58String()}, Multiaddrs ${multiaddresses}`);
    }
    async stop() {
        // Must goodbye and disconnect before stopping libp2p
        await this.peerManager.goodbyeAndDisconnectAllPeers();
        await this.peerManager.stop();
        this.gossip.stop();
        this.reqResp.stop();
        this.attnetsService.stop();
        this.syncnetsService.stop();
        this.gossip.stop();
        await this.libp2p.stop();
    }
    get discv5() {
        var _a;
        return (_a = this.peerManager["discovery"]) === null || _a === void 0 ? void 0 : _a.discv5;
    }
    get localMultiaddrs() {
        return this.libp2p.multiaddrs;
    }
    get peerId() {
        return this.libp2p.peerId;
    }
    getEnr() {
        var _a;
        return (_a = this.peerManager["discovery"]) === null || _a === void 0 ? void 0 : _a.discv5.enr;
    }
    getConnectionsByPeer() {
        return this.libp2p.connectionManager.connections;
    }
    getConnectedPeers() {
        return this.peerManager.getConnectedPeerIds();
    }
    hasSomeConnectedPeer() {
        return this.peerManager.hasSomeConnectedPeer();
    }
    /**
     * Request att subnets up `toSlot`. Network will ensure to mantain some peers for each
     */
    prepareBeaconCommitteeSubnet(subscriptions) {
        this.attnetsService.addCommitteeSubscriptions(subscriptions);
        if (subscriptions.length > 0)
            this.peerManager.onCommitteeSubscriptions();
    }
    prepareSyncCommitteeSubnets(subscriptions) {
        this.syncnetsService.addCommitteeSubscriptions(subscriptions);
        if (subscriptions.length > 0)
            this.peerManager.onCommitteeSubscriptions();
    }
    /**
     * The app layer needs to refresh the status of some peers. The sync have reached a target
     */
    reStatusPeers(peers) {
        this.peerManager.reStatusPeers(peers);
    }
    reportPeer(peer, action, actionName) {
        this.peerRpcScores.applyAction(peer, action, actionName);
    }
    /**
     * Subscribe to all gossip events. Safe to call multiple times
     */
    subscribeGossipCoreTopics() {
        if (!this.isSubscribedToGossipCoreTopics()) {
            this.logger.info("Subscribed gossip core topics");
        }
        const currentEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(this.chain.forkChoice.getHead().slot);
        for (const fork of (0, forks_1.getActiveForks)(this.config, currentEpoch)) {
            this.subscribeCoreTopicsAtFork(fork);
        }
    }
    /**
     * Unsubscribe from all gossip events. Safe to call multiple times
     */
    unsubscribeGossipCoreTopics() {
        for (const fork of this.subscribedForks.values()) {
            this.unsubscribeCoreTopicsAtFork(fork);
        }
        // Drop all the gossip validation queues
        for (const jobQueue of Object.values(this.gossip.jobQueues)) {
            jobQueue.dropAllJobs();
        }
    }
    isSubscribedToGossipCoreTopics() {
        return this.subscribedForks.size > 0;
    }
    // Debug
    async connectToPeer(peer, multiaddr) {
        this.libp2p.peerStore.addressBook.add(peer, multiaddr);
        await this.libp2p.dial(peer);
    }
    async disconnectPeer(peer) {
        await this.libp2p.hangUp(peer);
    }
}
exports.Network = Network;
//# sourceMappingURL=network.js.map