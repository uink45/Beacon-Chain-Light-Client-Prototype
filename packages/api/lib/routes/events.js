"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventSerdes = exports.getTypeByEvent = exports.routesData = exports.EventType = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
const utils_1 = require("../utils");
var EventType;
(function (EventType) {
    /**
     * The node has finished processing, resulting in a new head. previous_duty_dependent_root is
     * `get_block_root_at_slot(state, compute_start_slot_at_epoch(epoch - 1) - 1)` and
     * current_duty_dependent_root is `get_block_root_at_slot(state, compute_start_slot_at_epoch(epoch) - 1)`.
     * Both dependent roots use the genesis block root in the case of underflow.
     */
    EventType["head"] = "head";
    /** The node has received a valid block (from P2P or API) */
    EventType["block"] = "block";
    /** The node has received a valid attestation (from P2P or API) */
    EventType["attestation"] = "attestation";
    /** The node has received a valid voluntary exit (from P2P or API) */
    EventType["voluntaryExit"] = "voluntary_exit";
    /** Finalized checkpoint has been updated */
    EventType["finalizedCheckpoint"] = "finalized_checkpoint";
    /** The node has reorganized its chain */
    EventType["chainReorg"] = "chain_reorg";
    /** New or better header update available */
    EventType["lightclientHeaderUpdate"] = "lightclient_header_update";
})(EventType = exports.EventType || (exports.EventType = {}));
exports.routesData = {
    eventstream: { url: "/eth/v1/events", method: "GET" },
};
// It doesn't make sense to define a getReqSerializers() here given the exotic argument of eventstream()
// The request is very simple: (topics) => {query: {topics}}, and the test will ensure compatibility server - client
function getTypeByEvent() {
    const stringType = new lodestar_types_1.StringType();
    return {
        [EventType.head]: new ssz_1.ContainerType({
            fields: {
                slot: lodestar_types_1.ssz.Slot,
                block: stringType,
                state: stringType,
                epochTransition: lodestar_types_1.ssz.Boolean,
                previousDutyDependentRoot: stringType,
                currentDutyDependentRoot: stringType,
            },
            // From beacon apis eventstream
            casingMap: {
                slot: "slot",
                block: "block",
                state: "state",
                epochTransition: "epoch_transition",
                previousDutyDependentRoot: "previous_duty_dependent_root",
                currentDutyDependentRoot: "current_duty_dependent_root",
            },
        }),
        [EventType.block]: new ssz_1.ContainerType({
            fields: {
                slot: lodestar_types_1.ssz.Slot,
                block: stringType,
            },
            // From beacon apis eventstream
            expectedCase: "notransform",
        }),
        [EventType.attestation]: lodestar_types_1.ssz.phase0.Attestation,
        [EventType.voluntaryExit]: lodestar_types_1.ssz.phase0.SignedVoluntaryExit,
        [EventType.finalizedCheckpoint]: new ssz_1.ContainerType({
            fields: {
                block: stringType,
                state: stringType,
                epoch: lodestar_types_1.ssz.Epoch,
            },
            // From beacon apis eventstream
            expectedCase: "notransform",
        }),
        [EventType.chainReorg]: new ssz_1.ContainerType({
            fields: {
                slot: lodestar_types_1.ssz.Slot,
                depth: lodestar_types_1.ssz.Number64,
                oldHeadBlock: stringType,
                newHeadBlock: stringType,
                oldHeadState: stringType,
                newHeadState: stringType,
                epoch: lodestar_types_1.ssz.Epoch,
            },
            // From beacon apis eventstream
            casingMap: {
                slot: "slot",
                depth: "depth",
                oldHeadBlock: "old_head_block",
                newHeadBlock: "new_head_block",
                oldHeadState: "old_head_state",
                newHeadState: "new_head_state",
                epoch: "epoch",
            },
        }),
        [EventType.lightclientHeaderUpdate]: new ssz_1.ContainerType({
            fields: {
                syncAggregate: lodestar_types_1.ssz.altair.SyncAggregate,
                attestedHeader: lodestar_types_1.ssz.phase0.BeaconBlockHeader,
            },
            casingMap: {
                syncAggregate: "sync_aggregate",
                attestedHeader: "attested_header",
            },
        }),
    };
}
exports.getTypeByEvent = getTypeByEvent;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
function getEventSerdes() {
    const typeByEvent = getTypeByEvent();
    return {
        toJson: (event) => {
            const eventType = typeByEvent[event.type];
            return eventType.toJson(event.message, utils_1.jsonOpts);
        },
        fromJson: (type, data) => {
            const eventType = typeByEvent[type];
            return eventType.fromJson(data, utils_1.jsonOpts);
        },
    };
}
exports.getEventSerdes = getEventSerdes;
//# sourceMappingURL=events.js.map