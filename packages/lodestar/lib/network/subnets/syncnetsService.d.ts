import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { ForkName } from "@chainsafe/lodestar-params";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IBeaconChain } from "../../chain";
import { Eth2Gossipsub } from "../gossip";
import { MetadataController } from "../metadata";
import { RequestedSubnet } from "../peers/utils";
import { CommitteeSubscription, ISubnetsService, SubnetsServiceOpts } from "./interface";
/**
 * Manage sync committee subnets. Sync committees are long (~27h) so there aren't random long-lived subscriptions
 */
export declare class SyncnetsService implements ISubnetsService {
    private readonly config;
    private readonly chain;
    private readonly gossip;
    private readonly metadata;
    private readonly logger;
    private readonly opts?;
    /**
     * All currently subscribed subnets. Syncnets do not have additional long-lived
     * random subscriptions since the committees are already active for long periods of time.
     * Also, the node will aggregate through the entire period to simplify the validator logic.
     * So `subscriptionsCommittee` represents subnets to find peers and aggregate data.
     * This class will tell gossip to subscribe and un-subscribe.
     * If a value exists for `SubscriptionId` it means that gossip subscription is active in network.gossip
     */
    private subscriptionsCommittee;
    constructor(config: IBeaconConfig, chain: IBeaconChain, gossip: Eth2Gossipsub, metadata: MetadataController, logger: ILogger, opts?: SubnetsServiceOpts | undefined);
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
    /** Call ONLY ONCE: Two epoch before the fork, re-subscribe all existing random subscriptions to the new fork  */
    subscribeSubnetsToNextFork(nextFork: ForkName): void;
    /** Call  ONLY ONCE: Two epochs after the fork, un-subscribe all subnets from the old fork */
    unsubscribeSubnetsFromPrevFork(prevFork: ForkName): void;
    /**
     * Run per epoch, clean-up operations that are not urgent
     */
    private onEpoch;
    /** Update ENR */
    private updateMetadata;
    /** Tigger a gossip subcription only if not already subscribed */
    private subscribeToSubnets;
    /** Trigger a gossip un-subscrition only if no-one is still subscribed */
    private unsubscribeSubnets;
}
//# sourceMappingURL=syncnetsService.d.ts.map