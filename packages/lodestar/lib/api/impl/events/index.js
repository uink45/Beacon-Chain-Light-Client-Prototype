"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsApi = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const chain_1 = require("../../../chain");
const lodestar_api_1 = require("@chainsafe/lodestar-api");
const errors_1 = require("../errors");
const ssz_1 = require("@chainsafe/ssz");
/**
 * Mapping of internal `ChainEvents` to API spec events
 */
const chainEventMap = {
    [lodestar_api_1.routes.events.EventType.head]: chain_1.ChainEvent.forkChoiceHead,
    [lodestar_api_1.routes.events.EventType.block]: chain_1.ChainEvent.block,
    [lodestar_api_1.routes.events.EventType.attestation]: chain_1.ChainEvent.attestation,
    [lodestar_api_1.routes.events.EventType.voluntaryExit]: chain_1.ChainEvent.block,
    [lodestar_api_1.routes.events.EventType.finalizedCheckpoint]: chain_1.ChainEvent.finalized,
    [lodestar_api_1.routes.events.EventType.chainReorg]: chain_1.ChainEvent.forkChoiceReorg,
    [lodestar_api_1.routes.events.EventType.lightclientHeaderUpdate]: chain_1.ChainEvent.lightclientHeaderUpdate,
};
function getEventsApi({ chain, config }) {
    /**
     * Mapping to convert internal `ChainEvents` payload to the API spec events data
     */
    const eventDataTransformers = {
        [lodestar_api_1.routes.events.EventType.head]: (head) => {
            const state = chain.stateCache.get(head.stateRoot);
            if (!state) {
                throw Error("cannot get state for head " + head.stateRoot);
            }
            const currentEpoch = state.currentShuffling.epoch;
            const [previousDutyDependentRoot, currentDutyDependentRoot] = [currentEpoch - 1, currentEpoch].map((epoch) => (0, ssz_1.toHexString)((0, lodestar_beacon_state_transition_1.getBlockRootAtSlot)(state, Math.max((0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(epoch) - 1, 0))));
            return [
                {
                    block: head.blockRoot,
                    epochTransition: (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)((0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(head.slot)) === head.slot,
                    slot: head.slot,
                    state: head.stateRoot,
                    previousDutyDependentRoot,
                    currentDutyDependentRoot,
                },
            ];
        },
        [lodestar_api_1.routes.events.EventType.block]: (block) => [
            {
                block: (0, ssz_1.toHexString)(config.getForkTypes(block.message.slot).BeaconBlock.hashTreeRoot(block.message)),
                slot: block.message.slot,
            },
        ],
        [lodestar_api_1.routes.events.EventType.attestation]: (attestation) => [attestation],
        [lodestar_api_1.routes.events.EventType.voluntaryExit]: (block) => Array.from(block.message.body.voluntaryExits),
        [lodestar_api_1.routes.events.EventType.finalizedCheckpoint]: (checkpoint, state) => [
            {
                block: (0, ssz_1.toHexString)(checkpoint.root),
                epoch: checkpoint.epoch,
                state: (0, ssz_1.toHexString)(state.hashTreeRoot()),
            },
        ],
        [lodestar_api_1.routes.events.EventType.chainReorg]: (oldHead, newHead, depth) => [
            {
                depth,
                epoch: (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(newHead.slot),
                slot: newHead.slot,
                newHeadBlock: newHead.blockRoot,
                oldHeadBlock: oldHead.blockRoot,
                newHeadState: newHead.stateRoot,
                oldHeadState: oldHead.stateRoot,
            },
        ],
        [lodestar_api_1.routes.events.EventType.lightclientHeaderUpdate]: (headerUpdate) => [headerUpdate],
    };
    return {
        eventstream(topics, signal, onEvent) {
            const onAbortFns = [];
            for (const topic of topics) {
                const eventDataTransformer = eventDataTransformers[topic];
                const chainEvent = chainEventMap[topic];
                if (eventDataTransformer === undefined || !chainEvent) {
                    throw new errors_1.ApiError(400, `Unknown topic ${topic}`);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const handler = (...args) => {
                    // TODO: What happens if this handler throws? Does it break the other chain.emitter listeners?
                    const messages = eventDataTransformer(...args);
                    for (const message of messages) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                        onEvent({ type: topic, message: message });
                    }
                };
                chain.emitter.on(chainEvent, handler);
                onAbortFns.push(() => chain.emitter.off(chainEvent, handler));
            }
            signal.addEventListener("abort", () => {
                for (const abortFn of onAbortFns)
                    abortFn();
            }, { once: true });
        },
    };
}
exports.getEventsApi = getEventsApi;
//# sourceMappingURL=index.js.map