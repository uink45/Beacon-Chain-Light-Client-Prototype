import { Epoch, Number64, phase0, Slot, RootHex, altair } from "@chainsafe/lodestar-types";
import { Json, Type } from "@chainsafe/ssz";
import { RouteDef } from "../utils";
export declare type LightclientHeaderUpdate = {
    syncAggregate: altair.SyncAggregate;
    attestedHeader: phase0.BeaconBlockHeader;
};
export declare enum EventType {
    /**
     * The node has finished processing, resulting in a new head. previous_duty_dependent_root is
     * `get_block_root_at_slot(state, compute_start_slot_at_epoch(epoch - 1) - 1)` and
     * current_duty_dependent_root is `get_block_root_at_slot(state, compute_start_slot_at_epoch(epoch) - 1)`.
     * Both dependent roots use the genesis block root in the case of underflow.
     */
    head = "head",
    /** The node has received a valid block (from P2P or API) */
    block = "block",
    /** The node has received a valid attestation (from P2P or API) */
    attestation = "attestation",
    /** The node has received a valid voluntary exit (from P2P or API) */
    voluntaryExit = "voluntary_exit",
    /** Finalized checkpoint has been updated */
    finalizedCheckpoint = "finalized_checkpoint",
    /** The node has reorganized its chain */
    chainReorg = "chain_reorg",
    /** New or better header update available */
    lightclientHeaderUpdate = "lightclient_header_update"
}
export declare type EventData = {
    [EventType.head]: {
        slot: Slot;
        block: RootHex;
        state: RootHex;
        epochTransition: boolean;
        previousDutyDependentRoot: RootHex;
        currentDutyDependentRoot: RootHex;
    };
    [EventType.block]: {
        slot: Slot;
        block: RootHex;
    };
    [EventType.attestation]: phase0.Attestation;
    [EventType.voluntaryExit]: phase0.SignedVoluntaryExit;
    [EventType.finalizedCheckpoint]: {
        block: RootHex;
        state: RootHex;
        epoch: Epoch;
    };
    [EventType.chainReorg]: {
        slot: Slot;
        depth: Number64;
        oldHeadBlock: RootHex;
        newHeadBlock: RootHex;
        oldHeadState: RootHex;
        newHeadState: RootHex;
        epoch: Epoch;
    };
    [EventType.lightclientHeaderUpdate]: LightclientHeaderUpdate;
};
export declare type BeaconEvent = {
    [K in EventType]: {
        type: K;
        message: EventData[K];
    };
}[EventType];
export declare type Api = {
    /**
     * Subscribe to beacon node events
     * Provides endpoint to subscribe to beacon node Server-Sent-Events stream.
     * Consumers should use [eventsource](https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface)
     * implementation to listen on those events.
     *
     * @param topics Event types to subscribe to
     * @returns Opened SSE stream.
     */
    eventstream(topics: EventType[], signal: AbortSignal, onEvent: (event: BeaconEvent) => void): void;
};
export declare const routesData: {
    [K in keyof Api]: RouteDef;
};
export declare type ReqTypes = {
    eventstream: {
        query: {
            topics: EventType[];
        };
    };
};
export declare function getTypeByEvent(): {
    [K in EventType]: Type<EventData[K]>;
};
export declare function getEventSerdes(): {
    toJson: (event: BeaconEvent) => Json;
    fromJson: (type: EventType, data: Json) => BeaconEvent["message"];
};
//# sourceMappingURL=events.d.ts.map