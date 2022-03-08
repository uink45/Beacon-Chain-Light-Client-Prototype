"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttnetsService = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const shuffle_1 = require("../../util/shuffle");
const chain_1 = require("../../chain");
const gossip_1 = require("../gossip");
const utils_1 = require("../peers/utils");
const forks_1 = require("../forks");
/**
 * The time (in slots) before a last seen validator is considered absent and we unsubscribe from the random
 * gossip topics that we subscribed to due to the validator connection.
 */
const LAST_SEEN_VALIDATOR_TIMEOUT = 150;
const gossipType = gossip_1.GossipType.beacon_attestation;
/**
 * Manage random (long lived) subnets and committee (short lived) subnets.
 */
class AttnetsService {
    constructor(config, chain, gossip, metadata, logger, opts) {
        this.config = config;
        this.chain = chain;
        this.gossip = gossip;
        this.metadata = metadata;
        this.logger = logger;
        this.opts = opts;
        /** Committee subnets - PeerManager must find peers for those */
        this.committeeSubnets = new utils_1.SubnetMap();
        /**
         * All currently subscribed short-lived subnets, for attestation aggregation
         * This class will tell gossip to subscribe and un-subscribe
         * If a value exists for `SubscriptionId` it means that gossip subscription is active in network.gossip
         */
        this.subscriptionsCommittee = new utils_1.SubnetMap();
        /** Same as `subscriptionsCommittee` but for long-lived subnets. May overlap with `subscriptionsCommittee` */
        this.subscriptionsRandom = new utils_1.SubnetMap();
        /**
         * A collection of seen validators. These dictate how many random subnets we should be
         * subscribed to. As these time out, we unsubscribe from the required random subnets and update our ENR.
         * This is a map of validator index and its last active slot.
         */
        this.knownValidators = new Map();
        /**
         * Run per slot.
         */
        this.onSlot = (slot) => {
            try {
                this.unsubscribeExpiredCommitteeSubnets(slot);
            }
            catch (e) {
                this.logger.error("Error on AttnetsService.onSlot", { slot }, e);
            }
        };
        /**
         * Run per epoch, clean-up operations that are not urgent
         */
        this.onEpoch = (epoch) => {
            try {
                const slot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(epoch);
                this.unsubscribeExpiredRandomSubnets(slot);
                this.pruneExpiredKnownValidators(slot);
            }
            catch (e) {
                this.logger.error("Error on AttnetsService.onEpoch", { epoch }, e);
            }
        };
    }
    start() {
        this.chain.emitter.on(chain_1.ChainEvent.clockSlot, this.onSlot);
        this.chain.emitter.on(chain_1.ChainEvent.clockEpoch, this.onEpoch);
    }
    stop() {
        this.chain.emitter.off(chain_1.ChainEvent.clockSlot, this.onSlot);
        this.chain.emitter.off(chain_1.ChainEvent.clockEpoch, this.onEpoch);
    }
    /**
     * Get all active subnets for the hearbeat.
     */
    getActiveSubnets() {
        // Omit subscriptionsRandom, not necessary to force the network component to keep peers on that subnets
        return this.committeeSubnets.getActiveTtl(this.chain.clock.currentSlot);
    }
    /**
     * Called from the API when validator is a part of a committee.
     */
    addCommitteeSubscriptions(subscriptions) {
        const currentSlot = this.chain.clock.currentSlot;
        let addedknownValidators = false;
        const subnetsToSubscribe = [];
        for (const { validatorIndex, subnet, slot, isAggregator } of subscriptions) {
            // Add known validator
            if (!this.knownValidators.has(validatorIndex))
                addedknownValidators = true;
            this.knownValidators.set(validatorIndex, currentSlot);
            // the peer-manager heartbeat will help find the subnet
            this.committeeSubnets.request({ subnet, toSlot: slot + 1 });
            if (isAggregator) {
                // need exact slot here
                subnetsToSubscribe.push({ subnet, toSlot: slot });
            }
        }
        // Trigger gossip subscription first, in batch
        if (subnetsToSubscribe.length > 0) {
            this.subscribeToSubnets(subnetsToSubscribe.map((sub) => sub.subnet));
        }
        // Then, register the subscriptions
        for (const subscription of subnetsToSubscribe) {
            this.subscriptionsCommittee.request(subscription);
        }
        if (addedknownValidators)
            this.rebalanceRandomSubnets();
    }
    /**
     * Check if a subscription is still active before handling a gossip object
     */
    shouldProcess(subnet, slot) {
        return this.subscriptionsCommittee.isActiveAtSlot(subnet, slot);
    }
    /** Call ONLY ONCE: Two epoch before the fork, re-subscribe all existing random subscriptions to the new fork  */
    subscribeSubnetsToNextFork(nextFork) {
        this.logger.info("Suscribing to random attnets to next fork", { nextFork });
        for (const subnet of this.subscriptionsRandom.getAll()) {
            this.gossip.subscribeTopic({ type: gossipType, fork: nextFork, subnet });
        }
    }
    /** Call  ONLY ONCE: Two epochs after the fork, un-subscribe all subnets from the old fork */
    unsubscribeSubnetsFromPrevFork(prevFork) {
        var _a;
        this.logger.info("Unsuscribing to random attnets from prev fork", { prevFork });
        for (let subnet = 0; subnet < lodestar_params_1.ATTESTATION_SUBNET_COUNT; subnet++) {
            if (!((_a = this.opts) === null || _a === void 0 ? void 0 : _a.subscribeAllSubnets)) {
                this.gossip.unsubscribeTopic({ type: gossipType, fork: prevFork, subnet });
            }
        }
    }
    /**
     * Unsubscribe to a committee subnet from subscribedCommitteeSubnets.
     * If a random subnet is present, we do not unsubscribe from it.
     */
    unsubscribeExpiredCommitteeSubnets(slot) {
        const expired = this.subscriptionsCommittee.getExpired(slot);
        this.unsubscribeSubnets(expired, slot);
    }
    /**
     * A random subnet has expired.
     * This function selects a new subnet to join, or extends the expiry if there are no more
     * available subnets to choose from.
     */
    unsubscribeExpiredRandomSubnets(slot) {
        const expired = this.subscriptionsRandom.getExpired(slot);
        // TODO: Optimization: If we have to be subcribed to all subnets, no need to unsubscribe. Just extend the timeout
        // Prune subnets and re-subcribe to new ones
        this.unsubscribeSubnets(expired, slot);
        this.rebalanceRandomSubnets();
    }
    /**
     * A known validator has not sent a subscription in a while. They are considered offline and the
     * beacon node no longer needs to be subscribed to the allocated random subnets.
     *
     * We don't keep track of a specific validator to random subnet, rather the ratio of active
     * validators to random subnets. So when a validator goes offline, we can simply remove the
     * allocated amount of random subnets.
     */
    pruneExpiredKnownValidators(currentSlot) {
        let deletedKnownValidators = false;
        for (const [index, slot] of this.knownValidators.entries()) {
            if (currentSlot > slot + LAST_SEEN_VALIDATOR_TIMEOUT) {
                const deleted = this.knownValidators.delete(index);
                if (deleted)
                    deletedKnownValidators = true;
            }
        }
        if (deletedKnownValidators)
            this.rebalanceRandomSubnets();
    }
    /**
     * Called when we have new validators or expired validators.
     * knownValidators should be updated before this function.
     */
    rebalanceRandomSubnets() {
        const slot = this.chain.clock.currentSlot;
        // By limiting to ATTESTATION_SUBNET_COUNT, if target is still over subnetDiff equals 0
        const targetRandomSubnetCount = Math.min(this.knownValidators.size * lodestar_params_1.RANDOM_SUBNETS_PER_VALIDATOR, lodestar_params_1.ATTESTATION_SUBNET_COUNT);
        const subnetDiff = targetRandomSubnetCount - this.subscriptionsRandom.size;
        // subscribe to more random subnets
        if (subnetDiff > 0) {
            const activeSubnets = new Set(this.subscriptionsRandom.getActive(slot));
            const allSubnets = Array.from({ length: lodestar_params_1.ATTESTATION_SUBNET_COUNT }, (_, i) => i);
            const availableSubnets = allSubnets.filter((subnet) => !activeSubnets.has(subnet));
            const subnetsToConnect = (0, shuffle_1.shuffle)(availableSubnets).slice(0, subnetDiff);
            // Tell gossip to connect to the subnets if not connected already
            this.subscribeToSubnets(subnetsToConnect);
            // Register these new subnets until some future slot
            for (const subnet of subnetsToConnect) {
                // the heartbeat will help connect to respective peers
                this.subscriptionsRandom.request({ subnet, toSlot: randomSubscriptionSlotLen() + slot });
            }
        }
        // unsubscribe some random subnets
        if (subnetDiff < 0) {
            const activeRandomSubnets = this.subscriptionsRandom.getActive(slot);
            // TODO: Do we want to remove the oldest subnets or the newest subnets?
            // .slice(-2) will extract the last two items of the array
            const toRemoveSubnets = activeRandomSubnets.slice(subnetDiff);
            for (const subnet of toRemoveSubnets) {
                this.subscriptionsRandom.delete(subnet);
            }
            this.unsubscribeSubnets(toRemoveSubnets, slot);
        }
        // If there has been a change update the local ENR bitfield
        if (subnetDiff !== 0) {
            this.updateMetadata();
        }
    }
    /** Update ENR */
    updateMetadata() {
        const subnets = lodestar_types_1.ssz.phase0.AttestationSubnets.defaultValue();
        for (const subnet of this.subscriptionsRandom.getAll()) {
            subnets[subnet] = true;
        }
        // Only update metadata if necessary, setting `metadata.[key]` triggers a write to disk
        if (!lodestar_types_1.ssz.phase0.AttestationSubnets.equals(subnets, this.metadata.attnets)) {
            this.metadata.attnets = subnets;
        }
    }
    /** Tigger a gossip subcription only if not already subscribed */
    subscribeToSubnets(subnets) {
        const forks = (0, forks_1.getActiveForks)(this.config, this.chain.clock.currentEpoch);
        for (const subnet of subnets) {
            if (!this.subscriptionsCommittee.has(subnet) && !this.subscriptionsRandom.has(subnet)) {
                for (const fork of forks) {
                    this.gossip.subscribeTopic({ type: gossipType, fork, subnet });
                }
            }
        }
    }
    /** Trigger a gossip un-subscrition only if no-one is still subscribed */
    unsubscribeSubnets(subnets, slot) {
        var _a;
        // No need to unsubscribeTopic(). Return early to prevent repetitive extra work
        if ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.subscribeAllSubnets)
            return;
        const forks = (0, forks_1.getActiveForks)(this.config, this.chain.clock.currentEpoch);
        for (const subnet of subnets) {
            if (!this.subscriptionsCommittee.isActiveAtSlot(subnet, slot) &&
                !this.subscriptionsRandom.isActiveAtSlot(subnet, slot)) {
                for (const fork of forks) {
                    this.gossip.unsubscribeTopic({ type: gossipType, fork, subnet });
                }
            }
        }
    }
}
exports.AttnetsService = AttnetsService;
function randomSubscriptionSlotLen() {
    return ((0, lodestar_utils_1.randBetween)(lodestar_params_1.EPOCHS_PER_RANDOM_SUBNET_SUBSCRIPTION, 2 * lodestar_params_1.EPOCHS_PER_RANDOM_SUBNET_SUBSCRIPTION) * lodestar_params_1.SLOTS_PER_EPOCH);
}
//# sourceMappingURL=attnetsService.js.map