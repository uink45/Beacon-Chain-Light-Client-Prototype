import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { ForkName } from "@chainsafe/lodestar-params";
import { Slot } from "@chainsafe/lodestar-types";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IBeaconChain } from "../../chain";
import { Eth2Gossipsub } from "../gossip";
import { MetadataController } from "../metadata";
import { RequestedSubnet } from "../peers/utils";
import { IAttnetsService, CommitteeSubscription, SubnetsServiceOpts } from "./interface";
/**
 * Manage random (long lived) subnets and committee (short lived) subnets.
 */
export declare class AttnetsService implements IAttnetsService {
    private readonly config;
    private readonly chain;
    private readonly gossip;
    private readonly metadata;
    private readonly logger;
    private readonly opts?;
    /** Committee subnets - PeerManager must find peers for those */
    private committeeSubnets;
    /**
     * All currently subscribed short-lived subnets, for attestation aggregation
     * This class will tell gossip to subscribe and un-subscribe
     * If a value exists for `SubscriptionId` it means that gossip subscription is active in network.gossip
     */
    private subscriptionsCommittee;
    /** Same as `subscriptionsCommittee` but for long-lived subnets. May overlap with `subscriptionsCommittee` */
    private subscriptionsRandom;
    /**
     * A collection of seen validators. These dictate how many random subnets we should be
     * subscribed to. As these time out, we unsubscribe from the required random subnets and update our ENR.
     * This is a map of validator index and its last active slot.
     */
    private knownValidators;
    constructor(config: IChainForkConfig, chain: IBeaconChain, gossip: Eth2Gossipsub, metadata: MetadataController, logger: ILogger, opts?: SubnetsServiceOpts | undefined);
    start(): void;
    stop(): void;
    /**
     * Get all active subnets for the hearbeat.
     */
    getActiveSubnets(): RequestedSubnet[];
    /**
     * Called from the API when validator is a part of a committee.
     */
    addCommitteeSubscriptions(subscriptions: CommitteeSubscription[]): void;
    /**
     * Check if a subscription is still active before handling a gossip object
     */
    shouldProcess(subnet: number, slot: Slot): boolean;
    /** Call ONLY ONCE: Two epoch before the fork, re-subscribe all existing random subscriptions to the new fork  */
    subscribeSubnetsToNextFork(nextFork: ForkName): void;
    /** Call  ONLY ONCE: Two epochs after the fork, un-subscribe all subnets from the old fork */
    unsubscribeSubnetsFromPrevFork(prevFork: ForkName): void;
    /**
     * Run per slot.
     */
    private onSlot;
    /**
     * Run per epoch, clean-up operations that are not urgent
     */
    private onEpoch;
    /**
     * Unsubscribe to a committee subnet from subscribedCommitteeSubnets.
     * If a random subnet is present, we do not unsubscribe from it.
     */
    private unsubscribeExpiredCommitteeSubnets;
    /**
     * A random subnet has expired.
     * This function selects a new subnet to join, or extends the expiry if there are no more
     * available subnets to choose from.
     */
    private unsubscribeExpiredRandomSubnets;
    /**
     * A known validator has not sent a subscription in a while. They are considered offline and the
     * beacon node no longer needs to be subscribed to the allocated random subnets.
     *
     * We don't keep track of a specific validator to random subnet, rather the ratio of active
     * validators to random subnets. So when a validator goes offline, we can simply remove the
     * allocated amount of random subnets.
     */
    private pruneExpiredKnownValidators;
    /**
     * Called when we have new validators or expired validators.
     * knownValidators should be updated before this function.
     */
    private rebalanceRandomSubnets;
    /** Update ENR */
    private updateMetadata;
    /** Tigger a gossip subcription only if not already subscribed */
    private subscribeToSubnets;
    /** Trigger a gossip un-subscrition only if no-one is still subscribed */
    private unsubscribeSubnets;
}
//# sourceMappingURL=attnetsService.d.ts.map