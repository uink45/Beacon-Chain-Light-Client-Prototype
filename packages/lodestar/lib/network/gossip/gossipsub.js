"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eth2Gossipsub = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const libp2p_gossipsub_1 = __importDefault(require("libp2p-gossipsub"));
const constants_1 = require("libp2p-gossipsub/src/constants");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const interface_1 = require("./interface");
const topic_1 = require("./topic");
const encoding_1 = require("./encoding");
const constants_2 = require("./constants");
const errors_1 = require("./errors");
const constants_3 = require("../../constants");
const validation_1 = require("./validation");
const map_1 = require("../../util/map");
const it_pipe_1 = __importDefault(require("it-pipe"));
const utils_1 = require("libp2p-interfaces/src/pubsub/utils");
const scoringParameters_1 = require("./scoringParameters");
const scoreMetrics_1 = require("./scoreMetrics");
/**
 * Wrapper around js-libp2p-gossipsub with the following extensions:
 * - Eth2 message id
 * - Emits `GossipObject`, not `InMessage`
 * - Provides convenience interface:
 *   - `publishObject`
 *   - `subscribeTopic`
 *   - `unsubscribeTopic`
 *   - `handleTopic`
 *   - `unhandleTopic`
 *
 * See https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/p2p-interface.md#the-gossip-domain-gossipsub
 */
class Eth2Gossipsub extends libp2p_gossipsub_1.default {
    constructor(modules) {
        // Gossipsub parameters defined here:
        // https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/p2p-interface.md#the-gossip-domain-gossipsub
        super(modules.libp2p, {
            gossipIncoming: true,
            globalSignaturePolicy: "StrictNoSign",
            D: scoringParameters_1.GOSSIP_D,
            Dlo: scoringParameters_1.GOSSIP_D_LOW,
            Dhi: scoringParameters_1.GOSSIP_D_HIGH,
            Dlazy: 6,
            scoreParams: (0, scoringParameters_1.computeGossipPeerScoreParams)(modules),
            scoreThresholds: scoringParameters_1.gossipScoreThresholds,
        });
        this.uncompressCache = new encoding_1.UncompressCache();
        this.msgIdCache = new WeakMap();
        const { config, logger, metrics, signal, gossipHandlers } = modules;
        this.config = config;
        this.logger = logger;
        this.gossipTopicCache = new topic_1.GossipTopicCache(config);
        // Note: We use the validator functions as handlers. No handler will be registered to gossipsub.
        // libp2p-js layer will emit the message to an EventEmitter that won't be listened by anyone.
        // TODO: Force to ensure there's a validatorFunction attached to every received topic.
        const { validatorFnsByType, jobQueues } = (0, validation_1.createValidatorFnsByType)(gossipHandlers, {
            config,
            logger,
            peerRpcScores: modules.peerRpcScores,
            uncompressCache: this.uncompressCache,
            metrics,
            signal,
        });
        this.validatorFnsByType = validatorFnsByType;
        this.jobQueues = jobQueues;
        if (metrics) {
            metrics.gossipMesh.peersByType.addCollect(() => this.onScrapeMetrics(metrics));
        }
    }
    start() {
        super.start();
    }
    stop() {
        try {
            super.stop();
        }
        catch (error) {
            if (error.code !== "ERR_HEARTBEAT_NO_RUNNING") {
                throw error;
            }
        }
    }
    /**
     * @override Use eth2 msg id and cache results to the msg
     */
    getMsgId(msg) {
        let msgId = this.msgIdCache.get(msg);
        if (!msgId) {
            const topicStr = msg.topicIDs[0];
            const topic = this.gossipTopicCache.getTopic(topicStr);
            msgId = (0, encoding_1.computeMsgId)(topic, topicStr, msg.data, this.uncompressCache);
            this.msgIdCache.set(msg, msgId);
        }
        return msgId;
    }
    // Temporaly reverts https://github.com/libp2p/js-libp2p-interfaces/pull/103 while a proper fixed is done upstream
    // await-ing _processRpc causes messages to be processed 10-20 seconds latter than when received. This kills the node
    async _processMessages(idB58Str, stream, peerStreams) {
        try {
            await (0, it_pipe_1.default)(stream, async (source) => {
                for await (const data of source) {
                    const rpcBytes = data instanceof Uint8Array ? data : data.slice();
                    const rpcMsg = this._decodeRpc(rpcBytes);
                    this._processRpc(idB58Str, peerStreams, rpcMsg).catch((e) => {
                        this.log("_processRpc error", e.stack);
                    });
                }
            });
        }
        catch (err) {
            this._onPeerDisconnected(peerStreams.id, err);
        }
    }
    // Temporaly reverts https://github.com/libp2p/js-libp2p-interfaces/pull/103 while a proper fixed is done upstream
    // await-ing _processRpc causes messages to be processed 10-20 seconds latter than when received. This kills the node
    async _processRpc(idB58Str, peerStreams, rpc) {
        this.log("rpc from", idB58Str);
        const subs = rpc.subscriptions;
        const msgs = rpc.msgs;
        if (subs.length) {
            // update peer subscriptions
            subs.forEach((subOpt) => {
                this._processRpcSubOpt(idB58Str, subOpt);
            });
            this.emit("pubsub:subscription-change", peerStreams.id, subs);
        }
        if (!this._acceptFrom(idB58Str)) {
            this.log("received message from unacceptable peer %s", idB58Str);
            return false;
        }
        if (msgs.length) {
            await Promise.all(msgs.map(async (message) => {
                if (!(this.canRelayMessage ||
                    (message.topicIDs && message.topicIDs.some((topic) => this.subscriptions.has(topic))))) {
                    this.log("received message we didn't subscribe to. Dropping.");
                    return;
                }
                const msg = (0, utils_1.normalizeInRpcMessage)(message, idB58Str);
                await this._processRpcMessage(msg);
            }));
        }
        // not a direct implementation of js-libp2p-gossipsub, this is from gossipsub
        // https://github.com/ChainSafe/js-libp2p-gossipsub/blob/751ea73e9b7dc2287ca56786857d32ec2ce796b9/ts/index.ts#L366
        if (rpc.control) {
            super._processRpcControlMessage(idB58Str, rpc.control);
        }
        return true;
    }
    // // Snippet of _processRpcMessage from https://github.com/libp2p/js-libp2p-interfaces/blob/92245d66b0073f0a72fed9f7abcf4b533102f1fd/packages/interfaces/src/pubsub/index.js#L442
    // async _processRpcMessage(msg: InMessage): Promise<void> {
    //   try {
    //     await this.validate(msg);
    //   } catch (err) {
    //     this.log("Message is invalid, dropping it. %O", err);
    //     return;
    //   }
    // }
    /**
     * @override https://github.com/ChainSafe/js-libp2p-gossipsub/blob/3c3c46595f65823fcd7900ed716f43f76c6b355c/ts/index.ts#L436
     * @override https://github.com/libp2p/js-libp2p-interfaces/blob/ff3bd10704a4c166ce63135747e3736915b0be8d/src/pubsub/index.js#L513
     * Note: this does not call super. All logic is re-implemented below
     */
    async validate(message) {
        try {
            // messages must have a single topicID
            const topicStr = Array.isArray(message.topicIDs) ? message.topicIDs[0] : undefined;
            // message sanity check
            if (!topicStr || message.topicIDs.length > 1) {
                throw new errors_1.GossipValidationError(constants_1.ERR_TOPIC_VALIDATOR_REJECT, "Not exactly one topicID");
            }
            if (message.data === undefined) {
                throw new errors_1.GossipValidationError(constants_1.ERR_TOPIC_VALIDATOR_REJECT, "No message.data");
            }
            if (message.data.length > constants_3.GOSSIP_MAX_SIZE) {
                throw new errors_1.GossipValidationError(constants_1.ERR_TOPIC_VALIDATOR_REJECT, "message.data too big");
            }
            if (message.from || message.signature || message.key || message.seqno) {
                throw new errors_1.GossipValidationError(constants_1.ERR_TOPIC_VALIDATOR_REJECT, "StrictNoSigning invalid");
            }
            // We use 'StrictNoSign' policy, no need to validate message signature
            // Also validates that the topicStr is known
            const topic = this.gossipTopicCache.getTopic(topicStr);
            // Get seenTimestamp before adding the message to the queue or add async delays
            const seenTimestampSec = Date.now() / 1000;
            // No error here means that the incoming object is valid
            await this.validatorFnsByType[topic.type](topic, message, seenTimestampSec);
        }
        catch (e) {
            // JobQueue may throw non-typed errors
            const code = e instanceof errors_1.GossipValidationError ? e.code : constants_1.ERR_TOPIC_VALIDATOR_IGNORE;
            // async to compute msgId with sha256 from multiformats/hashes/sha2
            await this.score.rejectMessage(message, code);
            await this.gossipTracer.rejectMessage(message, code);
            throw e;
        }
    }
    /**
     * @override
     * See https://github.com/libp2p/js-libp2p-interfaces/blob/v0.5.2/src/pubsub/index.js#L428
     *
     * Our handlers are attached on the validator functions, so no need to emit the objects internally.
     */
    _emitMessage() {
        // Objects are handled in the validator functions, no need to do anything here
    }
    /**
     * @override
     * Differs from upstream `unsubscribe` by _always_ unsubscribing,
     * instead of unsubsribing only when no handlers are attached to the topic
     *
     * See https://github.com/libp2p/js-libp2p-interfaces/blob/v0.8.3/src/pubsub/index.js#L720
     */
    unsubscribe(topicStr) {
        if (!this.started) {
            throw new Error("Pubsub is not started");
        }
        if (this.subscriptions.has(topicStr)) {
            this.subscriptions.delete(topicStr);
            this.peers.forEach((_, id) => this._sendSubscriptions(id, [topicStr], false));
        }
    }
    /**
     * Publish a `GossipObject` on a `GossipTopic`
     */
    async publishObject(topic, object) {
        var _a;
        const topicStr = this.getGossipTopicString(topic);
        this.logger.verbose("Publish to topic", { topic: topicStr });
        const sszType = (0, topic_1.getGossipSSZType)(topic);
        const messageData = sszType.serialize(object);
        await this.publish(topicStr, (0, encoding_1.encodeMessageData)((_a = topic.encoding) !== null && _a !== void 0 ? _a : constants_2.DEFAULT_ENCODING, messageData));
    }
    /**
     * Subscribe to a `GossipTopic`
     */
    subscribeTopic(topic) {
        const topicStr = this.getGossipTopicString(topic);
        // Register known topicStr
        this.gossipTopicCache.setTopic(topicStr, topic);
        this.logger.verbose("Subscribe to gossipsub topic", { topic: topicStr });
        this.subscribe(topicStr);
    }
    /**
     * Unsubscribe to a `GossipTopic`
     */
    unsubscribeTopic(topic) {
        const topicStr = this.getGossipTopicString(topic);
        this.logger.verbose("Unsubscribe to gossipsub topic", { topic: topicStr });
        this.unsubscribe(topicStr);
    }
    async publishBeaconBlock(signedBlock) {
        const fork = this.config.getForkName(signedBlock.message.slot);
        await this.publishObject({ type: interface_1.GossipType.beacon_block, fork }, signedBlock);
    }
    async publishBeaconAggregateAndProof(aggregateAndProof) {
        const fork = this.config.getForkName(aggregateAndProof.message.aggregate.data.slot);
        await this.publishObject({ type: interface_1.GossipType.beacon_aggregate_and_proof, fork }, aggregateAndProof);
    }
    async publishBeaconAttestation(attestation, subnet) {
        const fork = this.config.getForkName(attestation.data.slot);
        await this.publishObject({ type: interface_1.GossipType.beacon_attestation, fork, subnet }, attestation);
    }
    async publishVoluntaryExit(voluntaryExit) {
        const fork = this.config.getForkName((0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(voluntaryExit.message.epoch));
        await this.publishObject({ type: interface_1.GossipType.voluntary_exit, fork }, voluntaryExit);
    }
    async publishProposerSlashing(proposerSlashing) {
        const fork = this.config.getForkName(proposerSlashing.signedHeader1.message.slot);
        await this.publishObject({ type: interface_1.GossipType.proposer_slashing, fork }, proposerSlashing);
    }
    async publishAttesterSlashing(attesterSlashing) {
        const fork = this.config.getForkName(attesterSlashing.attestation1.data.slot);
        await this.publishObject({ type: interface_1.GossipType.attester_slashing, fork }, attesterSlashing);
    }
    async publishSyncCommitteeSignature(signature, subnet) {
        const fork = this.config.getForkName(signature.slot);
        await this.publishObject({ type: interface_1.GossipType.sync_committee, fork, subnet }, signature);
    }
    async publishContributionAndProof(contributionAndProof) {
        const fork = this.config.getForkName(contributionAndProof.message.contribution.slot);
        await this.publishObject({ type: interface_1.GossipType.sync_committee_contribution_and_proof, fork }, contributionAndProof);
    }
    getGossipTopicString(topic) {
        return (0, topic_1.stringifyGossipTopic)(this.config, topic);
    }
    onScrapeMetrics(metrics) {
        var _a, _b, _c;
        for (const { peersMap, metricsGossip } of [
            { peersMap: this.mesh, metricsGossip: metrics.gossipMesh },
            { peersMap: this.topics, metricsGossip: metrics.gossipTopic },
        ]) {
            // Pre-aggregate results by fork so we can fill the remaining metrics with 0
            const peersByTypeByFork = new map_1.Map2d();
            const peersByBeaconAttSubnetByFork = new map_1.Map2dArr();
            const peersByBeaconSyncSubnetByFork = new map_1.Map2dArr();
            // loop through all mesh entries, count each set size
            for (const [topicString, peers] of peersMap) {
                // Ignore topics with 0 peers. May prevent overriding after a fork
                if (peers.size === 0)
                    continue;
                const topic = this.gossipTopicCache.getTopic(topicString);
                if (topic.type === interface_1.GossipType.beacon_attestation) {
                    peersByBeaconAttSubnetByFork.set(topic.fork, topic.subnet, peers.size);
                }
                else if (topic.type === interface_1.GossipType.sync_committee) {
                    peersByBeaconSyncSubnetByFork.set(topic.fork, topic.subnet, peers.size);
                }
                else {
                    peersByTypeByFork.set(topic.fork, topic.type, peers.size);
                }
            }
            // beacon attestation mesh gets counted separately so we can track mesh peers by subnet
            // zero out all gossip type & subnet choices, so the dashboard will register them
            for (const [fork, peersByType] of peersByTypeByFork.map) {
                for (const type of Object.values(interface_1.GossipType)) {
                    metricsGossip.peersByType.set({ fork, type }, (_a = peersByType.get(type)) !== null && _a !== void 0 ? _a : 0);
                }
            }
            for (const [fork, peersByBeaconAttSubnet] of peersByBeaconAttSubnetByFork.map) {
                for (let subnet = 0; subnet < lodestar_params_1.ATTESTATION_SUBNET_COUNT; subnet++) {
                    metricsGossip.peersByBeaconAttestationSubnet.set({ fork, subnet: attSubnetLabel(subnet) }, (_b = peersByBeaconAttSubnet[subnet]) !== null && _b !== void 0 ? _b : 0);
                }
            }
            for (const [fork, peersByBeaconSyncSubnet] of peersByBeaconSyncSubnetByFork.map) {
                for (let subnet = 0; subnet < lodestar_params_1.SYNC_COMMITTEE_SUBNET_COUNT; subnet++) {
                    // SYNC_COMMITTEE_SUBNET_COUNT is < 9, no need to prepend a 0 to the label
                    metricsGossip.peersBySyncCommitteeSubnet.set({ fork, subnet }, (_c = peersByBeaconSyncSubnet[subnet]) !== null && _c !== void 0 ? _c : 0);
                }
            }
        }
        // track gossip peer score
        let peerCountScoreGraylist = 0;
        let peerCountScorePublish = 0;
        let peerCountScoreGossip = 0;
        let peerCountScoreMesh = 0;
        const { graylistThreshold, publishThreshold, gossipThreshold } = scoringParameters_1.gossipScoreThresholds;
        const gossipScores = [];
        for (const peerIdStr of this.peers.keys()) {
            const score = this.score.score(peerIdStr);
            if (score >= graylistThreshold)
                peerCountScoreGraylist++;
            if (score >= publishThreshold)
                peerCountScorePublish++;
            if (score >= gossipThreshold)
                peerCountScoreGossip++;
            if (score >= 0)
                peerCountScoreMesh++;
            gossipScores.push(score);
        }
        // Access once for all calls below
        const { scoreByThreshold, scoreWeights } = metrics.gossipPeer;
        scoreByThreshold.set({ threshold: "graylist" }, peerCountScoreGraylist);
        scoreByThreshold.set({ threshold: "publish" }, peerCountScorePublish);
        scoreByThreshold.set({ threshold: "gossip" }, peerCountScoreGossip);
        scoreByThreshold.set({ threshold: "mesh" }, peerCountScoreMesh);
        // Breakdown on each score weight
        const sw = (0, scoreMetrics_1.computeAllPeersScoreWeights)(this.peers.keys(), this.score.peerStats, this.score.params, this.score.peerIPs, this.gossipTopicCache);
        for (const [topic, wsTopic] of sw.byTopic) {
            scoreWeights.set({ topic, p: "p1" }, wsTopic.p1w);
            scoreWeights.set({ topic, p: "p2" }, wsTopic.p2w);
            scoreWeights.set({ topic, p: "p3" }, wsTopic.p3w);
            scoreWeights.set({ topic, p: "p3b" }, wsTopic.p3bw);
            scoreWeights.set({ topic, p: "p4" }, wsTopic.p4w);
        }
        scoreWeights.set({ p: "p5" }, sw.p5w);
        scoreWeights.set({ p: "p6" }, sw.p6w);
        scoreWeights.set({ p: "p7" }, sw.p7w);
        // Register full score too
        metrics.gossipPeer.score.set(sw.score);
    }
}
exports.Eth2Gossipsub = Eth2Gossipsub;
/**
 * Left pad subnets to two characters. Assumes ATTESTATION_SUBNET_COUNT < 99
 * Otherwise grafana sorts the mesh peers chart as: [1,11,12,13,...]
 */
function attSubnetLabel(subnet) {
    if (subnet > 9)
        return String(subnet);
    else
        return `0${subnet}`;
}
//# sourceMappingURL=gossipsub.js.map