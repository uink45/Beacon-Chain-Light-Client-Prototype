"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeGossipPeerScoreParams = exports.gossipScoreThresholds = exports.GOSSIP_D_HIGH = exports.GOSSIP_D_LOW = exports.GOSSIP_D = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const peer_score_params_1 = require("libp2p-gossipsub/src/score/peer-score-params");
const forks_1 = require("../forks");
const interface_1 = require("./interface");
const topic_1 = require("./topic");
/* eslint-disable @typescript-eslint/naming-convention */
exports.GOSSIP_D = 8;
exports.GOSSIP_D_LOW = 6;
exports.GOSSIP_D_HIGH = 12;
const MAX_IN_MESH_SCORE = 10.0;
const MAX_FIRST_MESSAGE_DELIVERIES_SCORE = 40.0;
const BEACON_BLOCK_WEIGHT = 0.5;
const BEACON_AGGREGATE_PROOF_WEIGHT = 0.5;
const VOLUNTARY_EXIT_WEIGHT = 0.05;
const PROPOSER_SLASHING_WEIGHT = 0.05;
const ATTESTER_SLASHING_WEIGHT = 0.05;
const beaconAttestationSubnetWeight = 1 / lodestar_params_1.ATTESTATION_SUBNET_COUNT;
const maxPositiveScore = (MAX_IN_MESH_SCORE + MAX_FIRST_MESSAGE_DELIVERIES_SCORE) *
    (BEACON_BLOCK_WEIGHT +
        +BEACON_AGGREGATE_PROOF_WEIGHT +
        beaconAttestationSubnetWeight * lodestar_params_1.ATTESTATION_SUBNET_COUNT +
        VOLUNTARY_EXIT_WEIGHT +
        PROPOSER_SLASHING_WEIGHT +
        ATTESTER_SLASHING_WEIGHT);
/**
 * The following params is implemented by Lighthouse at
 * https://github.com/sigp/lighthouse/blob/b0ac3464ca5fb1e9d75060b56c83bfaf990a3d25/beacon_node/eth2_libp2p/src/behaviour/gossipsub_scoring_parameters.rs#L83
 */
exports.gossipScoreThresholds = {
    gossipThreshold: -4000,
    publishThreshold: -8000,
    graylistThreshold: -16000,
    acceptPXThreshold: 100,
    opportunisticGraftThreshold: 5,
};
/**
 * Explanation of each param https://github.com/libp2p/specs/blob/master/pubsub/gossipsub/gossipsub-v1.1.md#peer-scoring
 */
function computeGossipPeerScoreParams({ config, eth2Context, }) {
    const decayIntervalMs = config.SECONDS_PER_SLOT * 1000;
    const decayToZero = 0.01;
    const epochDurationMs = config.SECONDS_PER_SLOT * lodestar_params_1.SLOTS_PER_EPOCH * 1000;
    const slotDurationMs = config.SECONDS_PER_SLOT * 1000;
    const scoreParameterDecayFn = (decayTimeMs) => {
        return scoreParameterDecayWithBase(decayTimeMs, decayIntervalMs, decayToZero);
    };
    const behaviourPenaltyDecay = scoreParameterDecayFn(epochDurationMs * 10);
    const behaviourPenaltyThreshold = 6;
    const targetValue = decayConvergence(behaviourPenaltyDecay, 10 / lodestar_params_1.SLOTS_PER_EPOCH) - behaviourPenaltyThreshold;
    const topicScoreCap = maxPositiveScore * 0.5;
    const params = {
        topics: getAllTopicsScoreParams(config, eth2Context, {
            epochDurationMs,
            slotDurationMs,
            scoreParameterDecayFn,
        }),
        decayInterval: decayIntervalMs,
        decayToZero,
        // time to remember counters for a disconnected peer, should be in ms
        retainScore: epochDurationMs * 100,
        appSpecificWeight: 1,
        IPColocationFactorThreshold: 3,
        // js-gossipsub doesn't have behaviourPenaltiesThreshold
        behaviourPenaltyDecay,
        behaviourPenaltyWeight: exports.gossipScoreThresholds.gossipThreshold / (targetValue * targetValue),
        topicScoreCap,
        IPColocationFactorWeight: -1 * topicScoreCap,
    };
    return params;
}
exports.computeGossipPeerScoreParams = computeGossipPeerScoreParams;
function getAllTopicsScoreParams(config, eth2Context, precomputedParams) {
    const { epochDurationMs, slotDurationMs } = precomputedParams;
    const epoch = eth2Context.currentEpoch;
    const topicsParams = {};
    const forks = (0, forks_1.getActiveForks)(config, epoch);
    const beaconAttestationSubnetWeight = 1 / lodestar_params_1.ATTESTATION_SUBNET_COUNT;
    for (const fork of forks) {
        //first all fixed topics
        topicsParams[(0, topic_1.stringifyGossipTopic)(config, {
            type: interface_1.GossipType.voluntary_exit,
            fork,
        })] = getTopicScoreParams(config, precomputedParams, {
            topicWeight: VOLUNTARY_EXIT_WEIGHT,
            expectedMessageRate: 4 / lodestar_params_1.SLOTS_PER_EPOCH,
            firstMessageDecayTime: epochDurationMs * 100,
        });
        topicsParams[(0, topic_1.stringifyGossipTopic)(config, {
            type: interface_1.GossipType.attester_slashing,
            fork,
        })] = getTopicScoreParams(config, precomputedParams, {
            topicWeight: ATTESTER_SLASHING_WEIGHT,
            expectedMessageRate: 1 / 5 / lodestar_params_1.SLOTS_PER_EPOCH,
            firstMessageDecayTime: epochDurationMs * 100,
        });
        topicsParams[(0, topic_1.stringifyGossipTopic)(config, {
            type: interface_1.GossipType.proposer_slashing,
            fork,
        })] = getTopicScoreParams(config, precomputedParams, {
            topicWeight: PROPOSER_SLASHING_WEIGHT,
            expectedMessageRate: 1 / 5 / lodestar_params_1.SLOTS_PER_EPOCH,
            firstMessageDecayTime: epochDurationMs * 100,
        });
        // other topics
        topicsParams[(0, topic_1.stringifyGossipTopic)(config, {
            type: interface_1.GossipType.beacon_block,
            fork,
        })] = getTopicScoreParams(config, precomputedParams, {
            topicWeight: BEACON_BLOCK_WEIGHT,
            expectedMessageRate: 1,
            firstMessageDecayTime: epochDurationMs * 20,
            meshMessageInfo: {
                decaySlots: lodestar_params_1.SLOTS_PER_EPOCH * 5,
                capFactor: 3,
                activationWindow: epochDurationMs,
                currentSlot: eth2Context.currentSlot,
            },
        });
        const activeValidatorCount = eth2Context.activeValidatorCount;
        const { aggregatorsPerslot, committeesPerSlot } = expectedAggregatorCountPerSlot(activeValidatorCount);
        // Checks to prevent unwanted errors in gossipsub
        // Error: invalid score parameters for topic /eth2/4a26c58b/beacon_attestation_0/ssz_snappy: invalid FirstMessageDeliveriesCap; must be positive
        //   at Object.validatePeerScoreParams (/usr/app/node_modules/libp2p-gossipsub/src/score/peer-score-params.js:62:27)
        if (activeValidatorCount === 0)
            throw Error("activeValidatorCount === 0");
        if (aggregatorsPerslot === 0)
            throw Error("aggregatorsPerslot === 0");
        const multipleBurstsPerSubnetPerEpoch = committeesPerSlot >= (2 * lodestar_params_1.ATTESTATION_SUBNET_COUNT) / lodestar_params_1.SLOTS_PER_EPOCH;
        topicsParams[(0, topic_1.stringifyGossipTopic)(config, {
            type: interface_1.GossipType.beacon_aggregate_and_proof,
            fork,
        })] = getTopicScoreParams(config, precomputedParams, {
            topicWeight: BEACON_AGGREGATE_PROOF_WEIGHT,
            expectedMessageRate: aggregatorsPerslot,
            firstMessageDecayTime: epochDurationMs,
            meshMessageInfo: {
                decaySlots: lodestar_params_1.SLOTS_PER_EPOCH * 2,
                capFactor: 4,
                activationWindow: epochDurationMs,
                currentSlot: eth2Context.currentSlot,
            },
        });
        const beaconAttestationParams = getTopicScoreParams(config, precomputedParams, {
            topicWeight: beaconAttestationSubnetWeight,
            expectedMessageRate: activeValidatorCount / lodestar_params_1.ATTESTATION_SUBNET_COUNT / lodestar_params_1.SLOTS_PER_EPOCH,
            firstMessageDecayTime: multipleBurstsPerSubnetPerEpoch ? epochDurationMs : epochDurationMs * 4,
            meshMessageInfo: {
                decaySlots: multipleBurstsPerSubnetPerEpoch ? lodestar_params_1.SLOTS_PER_EPOCH * 4 : lodestar_params_1.SLOTS_PER_EPOCH * 16,
                capFactor: 16,
                activationWindow: multipleBurstsPerSubnetPerEpoch
                    ? slotDurationMs * (lodestar_params_1.SLOTS_PER_EPOCH / 2 + 1)
                    : epochDurationMs,
                currentSlot: eth2Context.currentSlot,
            },
        });
        for (let subnet = 0; subnet < lodestar_params_1.ATTESTATION_SUBNET_COUNT; subnet++) {
            const topicStr = (0, topic_1.stringifyGossipTopic)(config, {
                type: interface_1.GossipType.beacon_attestation,
                fork,
                subnet,
            });
            topicsParams[topicStr] = beaconAttestationParams;
        }
    }
    return topicsParams;
}
function getTopicScoreParams(config, { epochDurationMs, slotDurationMs, scoreParameterDecayFn }, { topicWeight, expectedMessageRate, firstMessageDecayTime, meshMessageInfo }) {
    const params = { ...peer_score_params_1.defaultTopicScoreParams };
    params.topicWeight = topicWeight;
    params.timeInMeshQuantum = slotDurationMs;
    params.timeInMeshCap = 3600 / (params.timeInMeshQuantum / 1000);
    params.timeInMeshWeight = 10 / params.timeInMeshCap;
    params.firstMessageDeliveriesDecay = scoreParameterDecayFn(firstMessageDecayTime);
    params.firstMessageDeliveriesCap = decayConvergence(params.firstMessageDeliveriesDecay, (2 * expectedMessageRate) / exports.GOSSIP_D);
    params.firstMessageDeliveriesWeight = 40 / params.firstMessageDeliveriesCap;
    if (meshMessageInfo) {
        const { decaySlots, capFactor, activationWindow, currentSlot } = meshMessageInfo;
        const decayTimeMs = config.SECONDS_PER_SLOT * decaySlots * 1000;
        params.meshMessageDeliveriesDecay = scoreParameterDecayFn(decayTimeMs);
        params.meshMessageDeliveriesThreshold = threshold(params.meshMessageDeliveriesDecay, expectedMessageRate / 50);
        params.meshMessageDeliveriesCap = Math.max(capFactor * params.meshMessageDeliveriesThreshold, 2);
        params.meshMessageDeliveriesActivation = activationWindow;
        params.meshMessageDeliveriesWindow = 2 * 1000; // 2s
        params.meshFailurePenaltyDecay = params.meshMessageDeliveriesDecay;
        params.meshMessageDeliveriesWeight =
            (-1 * maxPositiveScore) / (params.topicWeight * Math.pow(params.meshMessageDeliveriesThreshold, 2));
        params.meshFailurePenaltyWeight = params.meshMessageDeliveriesWeight;
        if (decaySlots >= currentSlot) {
            params.meshMessageDeliveriesThreshold = 0;
            params.meshMessageDeliveriesWeight = 0;
        }
    }
    else {
        params.meshMessageDeliveriesWeight = 0;
        params.meshMessageDeliveriesThreshold = 0;
        params.meshMessageDeliveriesDecay = 0;
        params.meshMessageDeliveriesCap = 0;
        params.meshMessageDeliveriesWindow = 0;
        params.meshMessageDeliveriesActivation = 0;
        params.meshFailurePenaltyDecay = 0;
        params.meshFailurePenaltyWeight = 0;
    }
    params.invalidMessageDeliveriesWeight = (-1 * maxPositiveScore) / params.topicWeight;
    params.invalidMessageDeliveriesDecay = scoreParameterDecayFn(epochDurationMs * 50);
    return params;
}
function scoreParameterDecayWithBase(decayTimeMs, decayIntervalMs, decayToZero) {
    const ticks = decayTimeMs / decayIntervalMs;
    return Math.pow(decayToZero, 1 / ticks);
}
function expectedAggregatorCountPerSlot(activeValidatorCount) {
    const committeesPerSlot = (0, lodestar_beacon_state_transition_1.computeCommitteeCount)(activeValidatorCount);
    const committeesPerEpoch = committeesPerSlot * lodestar_params_1.SLOTS_PER_EPOCH;
    const smallerCommitteeSize = Math.floor(activeValidatorCount / committeesPerEpoch);
    const largerCommiteeeSize = smallerCommitteeSize + 1;
    const largeCommitteesPerEpoch = activeValidatorCount - smallerCommitteeSize * committeesPerEpoch;
    const smallCommiteesPerEpoch = committeesPerEpoch - largeCommitteesPerEpoch;
    const moduloSmaller = Math.max(1, Math.floor(smallerCommitteeSize / lodestar_params_1.TARGET_AGGREGATORS_PER_COMMITTEE));
    const moduloLarger = Math.max(1, Math.floor((smallerCommitteeSize + 1) / lodestar_params_1.TARGET_AGGREGATORS_PER_COMMITTEE));
    const smallCommitteeAggregatorPerEpoch = Math.floor((smallerCommitteeSize / moduloSmaller) * smallCommiteesPerEpoch);
    const largeCommitteeAggregatorPerEpoch = Math.floor((largerCommiteeeSize / moduloLarger) * largeCommitteesPerEpoch);
    return {
        aggregatorsPerslot: Math.max(1, Math.floor((smallCommitteeAggregatorPerEpoch + largeCommitteeAggregatorPerEpoch) / lodestar_params_1.SLOTS_PER_EPOCH)),
        committeesPerSlot,
    };
}
function threshold(decay, rate) {
    return decayConvergence(decay, rate) * decay;
}
function decayConvergence(decay, rate) {
    return rate / (1 - decay);
}
//# sourceMappingURL=scoringParameters.js.map