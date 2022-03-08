"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAllPeersScoreWeights = exports.computeScoreWeights = void 0;
const map_1 = require("../../util/map");
const interface_1 = require("./interface");
const gossipTypes = Object.values(interface_1.GossipType);
function computeScoreWeights(peer, pstats, params, peerIPs, gossipTopicCache) {
    let score = 0;
    const byTopic = new map_1.MapDef(() => ({
        p1w: 0,
        p2w: 0,
        p3w: 0,
        p3bw: 0,
        p4w: 0,
    }));
    // topic stores
    Object.entries(pstats.topics).forEach(([topic, tstats]) => {
        // the topic parameters
        const topicType = gossipTopicCache.getTopic(topic).type;
        const topicParams = params.topics[topic];
        if (topicParams === undefined || topicType === undefined) {
            // we are not scoring this topic
            return;
        }
        const topicScores = byTopic.getOrDefault(topicType);
        let p1w = 0;
        let p2w = 0;
        let p3w = 0;
        let p3bw = 0;
        let p4w = 0;
        // P1: time in Mesh
        if (tstats.inMesh) {
            const p1 = Math.max(tstats.meshTime / topicParams.timeInMeshQuantum, topicParams.timeInMeshCap);
            p1w += p1 * topicParams.timeInMeshWeight;
        }
        // P2: first message deliveries
        const p2 = tstats.firstMessageDeliveries;
        p2w += p2 * topicParams.firstMessageDeliveriesWeight;
        // P3: mesh message deliveries
        if (tstats.meshMessageDeliveriesActive) {
            if (tstats.meshMessageDeliveries < topicParams.meshMessageDeliveriesThreshold) {
                const deficit = topicParams.meshMessageDeliveriesThreshold - tstats.meshMessageDeliveries;
                const p3 = deficit * deficit;
                p3w += p3 * topicParams.meshMessageDeliveriesWeight;
            }
        }
        // P3b:
        // NOTE: the weight of P3b is negative (validated in validateTopicScoreParams) so this detracts
        const p3b = tstats.meshFailurePenalty;
        p3bw += p3b * topicParams.meshFailurePenaltyWeight;
        // P4: invalid messages
        // NOTE: the weight of P4 is negative (validated in validateTopicScoreParams) so this detracts
        const p4 = tstats.invalidMessageDeliveries * tstats.invalidMessageDeliveries;
        p4w += p4 * topicParams.invalidMessageDeliveriesWeight;
        // update score, mixing with topic weight
        score += (p1w + p2w + p3w + p3bw + p4w) * topicParams.topicWeight;
        topicScores.p1w += p1w;
        topicScores.p2w += p2w;
        topicScores.p3w += p3w;
        topicScores.p3bw += p3bw;
        topicScores.p4w += p4w;
    });
    // apply the topic score cap, if any
    if (params.topicScoreCap > 0 && score > params.topicScoreCap) {
        score = params.topicScoreCap;
        // Proportionally apply cap to all individual contributions
        const capF = params.topicScoreCap / score;
        for (const ws of byTopic.values()) {
            ws.p1w *= capF;
            ws.p2w *= capF;
            ws.p3w *= capF;
            ws.p3bw *= capF;
            ws.p4w *= capF;
        }
    }
    let p5w = 0;
    let p6w = 0;
    let p7w = 0;
    // P5: application-specific score
    const p5 = params.appSpecificScore(peer);
    p5w += p5 * params.appSpecificWeight;
    // P6: IP colocation factor
    pstats.ips.forEach((ip) => {
        if (params.IPColocationFactorWhitelist.has(ip)) {
            return;
        }
        // P6 has a cliff (IPColocationFactorThreshold)
        // It's only applied if at least that many peers are connected to us from that source IP addr.
        // It is quadratic, and the weight is negative (validated in validatePeerScoreParams)
        const peersInIP = peerIPs.get(ip);
        const numPeersInIP = peersInIP ? peersInIP.size : 0;
        if (numPeersInIP > params.IPColocationFactorThreshold) {
            const surplus = numPeersInIP - params.IPColocationFactorThreshold;
            const p6 = surplus * surplus;
            p6w += p6 * params.IPColocationFactorWeight;
        }
    });
    // P7: behavioural pattern penalty
    const p7 = pstats.behaviourPenalty * pstats.behaviourPenalty;
    p7w += p7 * params.behaviourPenaltyWeight;
    score += p5w + p6w + p7w;
    return {
        byTopic,
        p5w,
        p6w,
        p7w,
        score,
    };
}
exports.computeScoreWeights = computeScoreWeights;
function computeAllPeersScoreWeights(peerIdStrs, peerStats, params, peerIPs, gossipTopicCache) {
    const sw = {
        byTopic: new map_1.MapDef(() => ({
            p1w: [],
            p2w: [],
            p3w: [],
            p3bw: [],
            p4w: [],
        })),
        p5w: [],
        p6w: [],
        p7w: [],
        score: [],
    };
    for (const peerIdStr of peerIdStrs) {
        const pstats = peerStats.get(peerIdStr);
        if (pstats) {
            const swPeer = computeScoreWeights(peerIdStr, pstats, params, peerIPs, gossipTopicCache);
            for (const topic of gossipTypes) {
                const swPeerTopic = swPeer.byTopic.getOrDefault(topic);
                const swTopic = sw.byTopic.getOrDefault(topic);
                swTopic.p1w.push(swPeerTopic.p1w);
                swTopic.p2w.push(swPeerTopic.p2w);
                swTopic.p3w.push(swPeerTopic.p3w);
                swTopic.p3bw.push(swPeerTopic.p3bw);
                swTopic.p4w.push(swPeerTopic.p4w);
            }
            sw.p5w.push(swPeer.p5w);
            sw.p6w.push(swPeer.p6w);
            sw.p7w.push(swPeer.p7w);
            sw.score.push(swPeer.score);
        }
        else {
            sw.p5w.push(0);
            sw.p6w.push(0);
            sw.p7w.push(0);
            sw.score.push(0);
        }
    }
    return sw;
}
exports.computeAllPeersScoreWeights = computeAllPeersScoreWeights;
//# sourceMappingURL=scoreMetrics.js.map