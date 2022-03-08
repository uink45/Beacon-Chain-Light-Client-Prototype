/**
 * @module network/gossip
 */
import { IForkDigestContext } from "@chainsafe/lodestar-config";
import { GossipTopic } from "./interface";
export interface IGossipTopicCache {
    getTopic(topicStr: string): GossipTopic;
}
export declare class GossipTopicCache implements IGossipTopicCache {
    private readonly forkDigestContext;
    private topicsByTopicStr;
    constructor(forkDigestContext: IForkDigestContext);
    getTopic(topicStr: string): GossipTopic;
    setTopic(topicStr: string, topic: GossipTopic): void;
}
/**
 * Stringify a GossipTopic into a spec-ed formated topic string
 */
export declare function stringifyGossipTopic(forkDigestContext: IForkDigestContext, topic: GossipTopic): string;
export declare function getGossipSSZType(topic: GossipTopic): import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/phase0").Attestation> | import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/phase0").AttesterSlashing> | import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/phase0").ProposerSlashing> | import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/phase0").SignedVoluntaryExit> | import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/phase0").SignedBeaconBlock> | import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/phase0").SignedAggregateAndProof> | import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/altair").SyncCommitteeMessage> | import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/altair").SignedContributionAndProof> | import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/altair").SignedBeaconBlock> | import("@chainsafe/ssz").ContainerType<import("@chainsafe/lodestar-types/bellatrix").SignedBeaconBlock>;
/**
 * Parse a `GossipTopic` object from its stringified form.
 * A gossip topic has the format
 * ```ts
 * /eth2/$FORK_DIGEST/$GOSSIP_TYPE/$ENCODING
 * ```
 */
export declare function parseGossipTopic(forkDigestContext: IForkDigestContext, topicStr: string): Required<GossipTopic>;
//# sourceMappingURL=topic.d.ts.map