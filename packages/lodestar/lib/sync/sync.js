"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeaconSync = void 0;
const network_1 = require("../network");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const chain_1 = require("../chain");
const range_1 = require("./range/range");
const remoteSyncType_1 = require("./utils/remoteSyncType");
const constants_1 = require("./constants");
const interface_1 = require("./interface");
const unknownBlock_1 = require("./unknownBlock");
class BeaconSync {
    constructor(opts, modules) {
        /** For metrics only */
        this.peerSyncType = new Map();
        /**
         * A peer has connected which has blocks that are unknown to us.
         *
         * This function handles the logic associated with the connection of a new peer. If the peer
         * is sufficiently ahead of our current head, a range-sync (batch) sync is started and
         * batches of blocks are queued to download from the peer. Batched blocks begin at our latest
         * finalized head.
         *
         * If the peer is within the `SLOT_IMPORT_TOLERANCE`, then it's head is sufficiently close to
         * ours that we consider it fully sync'd with respect to our current chain.
         */
        this.addPeer = (peerId, peerStatus) => {
            const localStatus = this.chain.getStatus();
            const syncType = (0, remoteSyncType_1.getPeerSyncType)(localStatus, peerStatus, this.chain.forkChoice, this.slotImportTolerance);
            // For metrics only
            this.peerSyncType.set(peerId.toB58String(), syncType);
            if (syncType === remoteSyncType_1.PeerSyncType.Advanced) {
                this.rangeSync.addPeer(peerId, localStatus, peerStatus);
            }
            this.updateSyncState();
        };
        /**
         * Must be called by libp2p when a peer is removed from the peer manager
         */
        this.removePeer = (peerId) => {
            this.rangeSync.removePeer(peerId);
            this.peerSyncType.delete(peerId.toB58String());
        };
        /**
         * Run this function when the sync state can potentially change.
         */
        this.updateSyncState = () => {
            var _a, _b;
            const state = this.state; // Don't run the getter twice
            // We have become synced, subscribe to all the gossip core topics
            if (state === interface_1.SyncState.Synced &&
                !this.network.isSubscribedToGossipCoreTopics() &&
                this.chain.clock.currentSlot >= constants_1.MIN_EPOCH_TO_START_GOSSIP) {
                this.network.subscribeGossipCoreTopics();
                (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.syncSwitchGossipSubscriptions.inc({ action: "subscribed" });
                this.logger.info("Subscribed gossip core topics");
            }
            // If we stopped being synced and falled significantly behind, stop gossip
            if (state !== interface_1.SyncState.Synced && this.network.isSubscribedToGossipCoreTopics()) {
                const syncDiff = this.chain.clock.currentSlot - this.chain.forkChoice.getHead().slot;
                if (syncDiff > this.slotImportTolerance * 2) {
                    this.logger.warn(`Node sync has fallen behind by ${syncDiff} slots`);
                    this.network.unsubscribeGossipCoreTopics();
                    (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.syncSwitchGossipSubscriptions.inc({ action: "unsubscribed" });
                    this.logger.info("Un-subscribed gossip core topics");
                }
            }
        };
        this.onClockEpoch = () => {
            // If a node witness the genesis event consider starting gossip
            // Also, ensure that updateSyncState is run at least once per epoch.
            // If the chain gets stuck or very overloaded it could helps to resolve the situation
            // by realizing it's way behind and turning gossip off.
            this.updateSyncState();
        };
        const { config, chain, metrics, network, logger } = modules;
        this.opts = opts;
        this.network = network;
        this.chain = chain;
        this.metrics = metrics;
        this.logger = logger;
        this.rangeSync = new range_1.RangeSync(modules, opts);
        this.unknownBlockSync = new unknownBlock_1.UnknownBlockSync(config, network, chain, logger, metrics, opts);
        this.slotImportTolerance = lodestar_params_1.SLOTS_PER_EPOCH;
        // Subscribe to RangeSync completing a SyncChain and recompute sync state
        if (!opts.disableRangeSync) {
            this.rangeSync.on(range_1.RangeSyncEvent.completedChain, this.updateSyncState);
            this.network.events.on(network_1.NetworkEvent.peerConnected, this.addPeer);
            this.network.events.on(network_1.NetworkEvent.peerDisconnected, this.removePeer);
        }
        // TODO: It's okay to start this on initial sync?
        this.chain.emitter.on(chain_1.ChainEvent.clockEpoch, this.onClockEpoch);
        if (metrics) {
            metrics.syncStatus.addCollect(() => this.scrapeMetrics(metrics));
        }
    }
    close() {
        this.network.events.off(network_1.NetworkEvent.peerConnected, this.addPeer);
        this.network.events.off(network_1.NetworkEvent.peerDisconnected, this.removePeer);
        this.chain.emitter.off(chain_1.ChainEvent.clockEpoch, this.onClockEpoch);
        this.rangeSync.close();
        this.unknownBlockSync.close();
    }
    getSyncStatus() {
        const currentSlot = this.chain.clock.currentSlot;
        const headSlot = this.chain.forkChoice.getHead().slot;
        switch (this.state) {
            case interface_1.SyncState.SyncingFinalized:
            case interface_1.SyncState.SyncingHead:
            case interface_1.SyncState.Stalled:
                return {
                    headSlot: headSlot,
                    syncDistance: currentSlot - headSlot,
                    isSyncing: true,
                };
            case interface_1.SyncState.Synced:
                return {
                    headSlot: headSlot,
                    syncDistance: 0,
                    isSyncing: false,
                };
            default:
                throw new Error("Node is stopped, cannot get sync status");
        }
    }
    isSyncing() {
        const state = this.state; // Don't run the getter twice
        return state === interface_1.SyncState.SyncingFinalized || state === interface_1.SyncState.SyncingHead;
    }
    isSynced() {
        return this.state === interface_1.SyncState.Synced;
    }
    get state() {
        const currentSlot = this.chain.clock.currentSlot;
        const headSlot = this.chain.forkChoice.getHead().slot;
        if (
        // Consider node synced IF
        // Before genesis OR
        (currentSlot < 0 ||
            // head is behind clock but close enough with some tolerance
            (headSlot <= currentSlot && headSlot >= currentSlot - this.slotImportTolerance)) &&
            // Ensure there at least one connected peer to not claim synced if has no peers
            // Allow to bypass this conditions for local networks with a single node
            (this.opts.isSingleNode || this.network.hasSomeConnectedPeer())
        // TODO: Consider enabling this condition (used in Lighthouse)
        // && headSlot > 0
        ) {
            return interface_1.SyncState.Synced;
        }
        const rangeSyncState = this.rangeSync.state;
        switch (rangeSyncState.status) {
            case range_1.RangeSyncStatus.Finalized:
                return interface_1.SyncState.SyncingFinalized;
            case range_1.RangeSyncStatus.Head:
                return interface_1.SyncState.SyncingHead;
            case range_1.RangeSyncStatus.Idle:
                return interface_1.SyncState.Stalled;
        }
    }
    /** Full debug state for lodestar API */
    getSyncChainsDebugState() {
        return this.rangeSync.getSyncChainsDebugState();
    }
    scrapeMetrics(metrics) {
        // Compute current sync state
        metrics.syncStatus.set(interface_1.syncStateMetric[this.state]);
        // Count peers by syncType
        const peerCountByType = {
            [remoteSyncType_1.PeerSyncType.Advanced]: 0,
            [remoteSyncType_1.PeerSyncType.FullySynced]: 0,
            [remoteSyncType_1.PeerSyncType.Behind]: 0,
        };
        for (const syncType of this.peerSyncType.values()) {
            peerCountByType[syncType]++;
        }
        for (const syncType of remoteSyncType_1.peerSyncTypes) {
            metrics.syncPeersBySyncType.set({ syncType }, peerCountByType[syncType]);
        }
    }
}
exports.BeaconSync = BeaconSync;
//# sourceMappingURL=sync.js.map