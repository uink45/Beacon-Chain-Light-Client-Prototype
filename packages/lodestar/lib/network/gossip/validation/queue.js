"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationQueues = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const queue_1 = require("../../../util/queue");
const interface_1 = require("../interface");
/**
 * Numbers from https://github.com/sigp/lighthouse/blob/b34a79dc0b02e04441ba01fd0f304d1e203d877d/beacon_node/network/src/beacon_processor/mod.rs#L69
 */
const gossipQueueOpts = {
    [interface_1.GossipType.beacon_block]: { maxLength: 1024, type: queue_1.QueueType.FIFO },
    // lighthoue has aggregate_queue 4096 and unknown_block_aggregate_queue 1024, we use single queue
    [interface_1.GossipType.beacon_aggregate_and_proof]: { maxLength: 5120, type: queue_1.QueueType.LIFO, maxConcurrency: 16 },
    // lighthouse has attestation_queue 16384 and unknown_block_attestation_queue 8192, we use single queue
    [interface_1.GossipType.beacon_attestation]: { maxLength: 24576, type: queue_1.QueueType.LIFO, maxConcurrency: 64 },
    [interface_1.GossipType.voluntary_exit]: { maxLength: 4096, type: queue_1.QueueType.FIFO },
    [interface_1.GossipType.proposer_slashing]: { maxLength: 4096, type: queue_1.QueueType.FIFO },
    [interface_1.GossipType.attester_slashing]: { maxLength: 4096, type: queue_1.QueueType.FIFO },
    [interface_1.GossipType.sync_committee_contribution_and_proof]: { maxLength: 4096, type: queue_1.QueueType.LIFO, maxConcurrency: 16 },
    [interface_1.GossipType.sync_committee]: { maxLength: 4096, type: queue_1.QueueType.LIFO, maxConcurrency: 64 },
};
/**
 * Wraps a GossipValidatorFn with a queue, to limit the processing of gossip objects by type.
 *
 * A queue here is essential to protect against DOS attacks, where a peer may send many messages at once.
 * Queues also protect the node against overloading. If the node gets bussy with an expensive epoch transition,
 * it may buffer too many gossip objects causing an Out of memory (OOM) error. With a queue the node will reject
 * new objects to fit its current throughput.
 *
 * Queues may buffer objects by
 *  - topic '/eth2/0011aabb/beacon_attestation_0/ssz_snappy'
 *  - type `GossipType.beacon_attestation`
 *  - all objects in one queue
 *
 * By topic is too specific, so by type groups all similar objects in the same queue. All in the same won't allow
 * to customize different queue behaviours per object type (see `gossipQueueOpts`).
 */
function createValidationQueues(gossipValidatorFns, signal, metrics) {
    return (0, lodestar_utils_1.mapValues)(gossipQueueOpts, (opts, type) => {
        const gossipValidatorFn = gossipValidatorFns[type];
        return new queue_1.JobItemQueue((topic, message, seenTimestampsMs) => gossipValidatorFn(topic, message, seenTimestampsMs), { signal, ...opts }, metrics
            ? {
                length: metrics.gossipValidationQueueLength.child({ topic: type }),
                droppedJobs: metrics.gossipValidationQueueDroppedJobs.child({ topic: type }),
                jobTime: metrics.gossipValidationQueueJobTime.child({ topic: type }),
                jobWaitTime: metrics.gossipValidationQueueJobWaitTime.child({ topic: type }),
            }
            : undefined);
    });
}
exports.createValidationQueues = createValidationQueues;
//# sourceMappingURL=queue.js.map