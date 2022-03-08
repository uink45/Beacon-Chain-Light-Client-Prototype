"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncnetsService = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const chain_1 = require("../../chain");
const forks_1 = require("../forks");
const gossip_1 = require("../gossip");
const utils_1 = require("../peers/utils");
const gossipType = gossip_1.GossipType.sync_committee;
/**
 * Manage sync committee subnets. Sync committees are long (~27h) so there aren't random long-lived subscriptions
 */
class SyncnetsService {
    constructor(config, chain, gossip, metadata, logger, opts) {
        this.config = config;
        this.chain = chain;
        this.gossip = gossip;
        this.metadata = metadata;
        this.logger = logger;
        this.opts = opts;
        /**
         * All currently subscribed subnets. Syncnets do not have additional long-lived
         * random subscriptions since the committees are already active for long periods of time.
         * Also, the node will aggregate through the entire period to simplify the validator logic.
         * So `subscriptionsCommittee` represents subnets to find peers and aggregate data.
         * This class will tell gossip to subscribe and un-subscribe.
         * If a value exists for `SubscriptionId` it means that gossip subscription is active in network.gossip
         */
        this.subscriptionsCommittee = new utils_1.SubnetMap();
        /**
         * Run per epoch, clean-up operations that are not urgent
         */
        this.onEpoch = (epoch) => {
            try {
                const slot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(epoch);
                // Unsubscribe to a committee subnet from subscriptionsCommittee.
                this.unsubscribeSubnets(this.subscriptionsCommittee.getExpired(slot));
            }
            catch (e) {
                this.logger.error("Error on SyncnetsService.onEpoch", { epoch }, e);
            }
        };
    }
    start() {
        this.chain.emitter.on(chain_1.ChainEvent.clockEpoch, this.onEpoch);
    }
    stop() {
        this.chain.emitter.off(chain_1.ChainEvent.clockEpoch, this.onEpoch);
    }
    /**
     * Get all active subnets for the hearbeat.
     */
    getActiveSubnets() {
        return this.subscriptionsCommittee.getActiveTtl(this.chain.clock.currentSlot);
    }
    /**
     * Called from the API when validator is a part of a committee.
     */
    addCommitteeSubscriptions(subscriptions) {
        // Trigger gossip subscription first, in batch
        if (subscriptions.length > 0) {
            this.subscribeToSubnets(subscriptions.map((sub) => sub.subnet));
        }
        // Then, register the subscriptions
        for (const { subnet, slot } of subscriptions) {
            this.subscriptionsCommittee.request({ subnet, toSlot: slot });
        }
        // For syncnets regular subscriptions are persisted in the ENR
        this.updateMetadata();
    }
    /** Call ONLY ONCE: Two epoch before the fork, re-subscribe all existing random subscriptions to the new fork  */
    subscribeSubnetsToNextFork(nextFork) {
        this.logger.info("Suscribing to random attnets to next fork", { nextFork });
        for (const subnet of this.subscriptionsCommittee.getAll()) {
            this.gossip.subscribeTopic({ type: gossipType, fork: nextFork, subnet });
        }
    }
    /** Call  ONLY ONCE: Two epochs after the fork, un-subscribe all subnets from the old fork */
    unsubscribeSubnetsFromPrevFork(prevFork) {
        var _a;
        this.logger.info("Unsuscribing to random attnets from prev fork", { prevFork });
        for (let subnet = 0; subnet < lodestar_params_1.SYNC_COMMITTEE_SUBNET_COUNT; subnet++) {
            if (!((_a = this.opts) === null || _a === void 0 ? void 0 : _a.subscribeAllSubnets)) {
                this.gossip.unsubscribeTopic({ type: gossipType, fork: prevFork, subnet });
            }
        }
    }
    /** Update ENR */
    updateMetadata() {
        const subnets = lodestar_types_1.ssz.altair.SyncSubnets.defaultValue();
        for (const subnet of this.subscriptionsCommittee.getAll()) {
            subnets[subnet] = true;
        }
        // Only update metadata if necessary, setting `metadata.[key]` triggers a write to disk
        if (!lodestar_types_1.ssz.altair.SyncSubnets.equals(subnets, this.metadata.syncnets)) {
            this.metadata.syncnets = subnets;
        }
    }
    /** Tigger a gossip subcription only if not already subscribed */
    subscribeToSubnets(subnets) {
        const forks = (0, forks_1.getActiveForks)(this.config, this.chain.clock.currentEpoch);
        for (const subnet of subnets) {
            if (!this.subscriptionsCommittee.has(subnet)) {
                for (const fork of forks) {
                    this.gossip.subscribeTopic({ type: gossipType, fork, subnet });
                }
            }
        }
    }
    /** Trigger a gossip un-subscrition only if no-one is still subscribed */
    unsubscribeSubnets(subnets) {
        var _a;
        const forks = (0, forks_1.getActiveForks)(this.config, this.chain.clock.currentEpoch);
        for (const subnet of subnets) {
            // No need to check if active in subscriptionsCommittee since we only have a single SubnetMap
            for (const fork of forks) {
                if (!((_a = this.opts) === null || _a === void 0 ? void 0 : _a.subscribeAllSubnets)) {
                    this.gossip.unsubscribeTopic({ type: gossipType, fork, subnet });
                }
            }
        }
    }
}
exports.SyncnetsService = SyncnetsService;
//# sourceMappingURL=syncnetsService.js.map