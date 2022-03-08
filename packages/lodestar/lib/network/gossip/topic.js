"use strict";
/**
 * @module network/gossip
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGossipTopic = exports.getGossipSSZType = exports.stringifyGossipTopic = exports.GossipTopicCache = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const interface_1 = require("./interface");
const constants_1 = require("./constants");
class GossipTopicCache {
    constructor(forkDigestContext) {
        this.forkDigestContext = forkDigestContext;
        this.topicsByTopicStr = new Map();
    }
    getTopic(topicStr) {
        let topic = this.topicsByTopicStr.get(topicStr);
        if (topic === undefined) {
            topic = parseGossipTopic(this.forkDigestContext, topicStr);
            // TODO: Consider just throwing here. We should only receive messages from known subscribed topics
            this.topicsByTopicStr.set(topicStr, topic);
        }
        return topic;
    }
    setTopic(topicStr, topic) {
        if (!this.topicsByTopicStr.has(topicStr)) {
            this.topicsByTopicStr.set(topicStr, { encoding: constants_1.DEFAULT_ENCODING, ...topic });
        }
    }
}
exports.GossipTopicCache = GossipTopicCache;
/**
 * Stringify a GossipTopic into a spec-ed formated topic string
 */
function stringifyGossipTopic(forkDigestContext, topic) {
    var _a;
    const forkDigestHexNoPrefix = forkDigestContext.forkName2ForkDigestHex(topic.fork);
    const topicType = stringifyGossipTopicType(topic);
    const encoding = (_a = topic.encoding) !== null && _a !== void 0 ? _a : constants_1.DEFAULT_ENCODING;
    return `/eth2/${forkDigestHexNoPrefix}/${topicType}/${encoding}`;
}
exports.stringifyGossipTopic = stringifyGossipTopic;
/**
 * Stringify a GossipTopic into a spec-ed formated partial topic string
 */
function stringifyGossipTopicType(topic) {
    switch (topic.type) {
        case interface_1.GossipType.beacon_block:
        case interface_1.GossipType.beacon_aggregate_and_proof:
        case interface_1.GossipType.voluntary_exit:
        case interface_1.GossipType.proposer_slashing:
        case interface_1.GossipType.attester_slashing:
        case interface_1.GossipType.sync_committee_contribution_and_proof:
            return topic.type;
        case interface_1.GossipType.beacon_attestation:
        case interface_1.GossipType.sync_committee:
            return `${topic.type}_${topic.subnet}`;
    }
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
function getGossipSSZType(topic) {
    switch (topic.type) {
        case interface_1.GossipType.beacon_block:
            // beacon_block is updated in altair to support the updated SignedBeaconBlock type
            return lodestar_types_1.ssz[topic.fork].SignedBeaconBlock;
        case interface_1.GossipType.beacon_aggregate_and_proof:
            return lodestar_types_1.ssz.phase0.SignedAggregateAndProof;
        case interface_1.GossipType.beacon_attestation:
            return lodestar_types_1.ssz.phase0.Attestation;
        case interface_1.GossipType.proposer_slashing:
            return lodestar_types_1.ssz.phase0.ProposerSlashing;
        case interface_1.GossipType.attester_slashing:
            return lodestar_types_1.ssz.phase0.AttesterSlashing;
        case interface_1.GossipType.voluntary_exit:
            return lodestar_types_1.ssz.phase0.SignedVoluntaryExit;
        case interface_1.GossipType.sync_committee_contribution_and_proof:
            return lodestar_types_1.ssz.altair.SignedContributionAndProof;
        case interface_1.GossipType.sync_committee:
            return lodestar_types_1.ssz.altair.SyncCommitteeMessage;
        default:
            throw new Error(`No ssz gossip type for ${topic.type}`);
    }
}
exports.getGossipSSZType = getGossipSSZType;
// Parsing
const gossipTopicRegex = new RegExp("^/eth2/(\\w+)/(\\w+)/(\\w+)");
/**
 * Parse a `GossipTopic` object from its stringified form.
 * A gossip topic has the format
 * ```ts
 * /eth2/$FORK_DIGEST/$GOSSIP_TYPE/$ENCODING
 * ```
 */
function parseGossipTopic(forkDigestContext, topicStr) {
    try {
        const matches = topicStr.match(gossipTopicRegex);
        if (matches === null) {
            throw Error(`Must match regex ${gossipTopicRegex}`);
        }
        const [, forkDigestHexNoPrefix, gossipTypeStr, encodingStr] = matches;
        const fork = forkDigestContext.forkDigest2ForkName(forkDigestHexNoPrefix);
        const encoding = parseEncodingStr(encodingStr);
        // Inline-d the parseGossipTopicType() function since spreading the resulting object x4 the time to parse a topicStr
        switch (gossipTypeStr) {
            case interface_1.GossipType.beacon_block:
            case interface_1.GossipType.beacon_aggregate_and_proof:
            case interface_1.GossipType.voluntary_exit:
            case interface_1.GossipType.proposer_slashing:
            case interface_1.GossipType.attester_slashing:
            case interface_1.GossipType.sync_committee_contribution_and_proof:
                return { type: gossipTypeStr, fork, encoding };
        }
        for (const gossipType of [interface_1.GossipType.beacon_attestation, interface_1.GossipType.sync_committee]) {
            if (gossipTypeStr.startsWith(gossipType)) {
                const subnetStr = gossipTypeStr.slice(gossipType.length + 1); // +1 for '_' concatenating the topic name and the subnet
                const subnet = parseInt(subnetStr, 10);
                if (Number.isNaN(subnet))
                    throw Error(`Subnet ${subnetStr} is not a number`);
                return { type: gossipType, subnet, fork, encoding };
            }
        }
        throw Error(`Unknown gossip type ${gossipTypeStr}`);
    }
    catch (e) {
        e.message = `Invalid gossip topic ${topicStr}: ${e.message}`;
        throw e;
    }
}
exports.parseGossipTopic = parseGossipTopic;
/**
 * Validate that a `encodingStr` is a known `GossipEncoding`
 */
function parseEncodingStr(encodingStr) {
    switch (encodingStr) {
        case interface_1.GossipEncoding.ssz_snappy:
            return encodingStr;
        default:
            throw Error(`Unknown encoding ${encodingStr}`);
    }
}
//# sourceMappingURL=topic.js.map