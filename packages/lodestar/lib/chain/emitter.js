"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainEventEmitter = exports.ChainEvent = void 0;
const events_1 = require("events");
/**
 * Important chain events that occur during normal chain operation.
 *
 * Chain events can be broken into several categories:
 * - Clock: the chain's clock is updated
 * - Fork Choice: the chain's fork choice is updated
 * - Processing: the chain processes attestations and blocks, either successfully or with an error
 * - Checkpointing: the chain processes epoch boundaries
 */
var ChainEvent;
(function (ChainEvent) {
    /**
     * This event signals that the chain has successfully processed a valid attestation.
     *
     * This event is guaranteed to be emitted after every attestation fed to the chain has successfully been passed to the fork choice.
     */
    ChainEvent["attestation"] = "attestation";
    /**
     * This event signals that the chain has successfully processed a valid block.
     *
     * This event is guaranteed to be emitted after every block fed to the chain has successfully passed the state transition.
     */
    ChainEvent["block"] = "block";
    /**
     * This event signals that the chain has processed (or reprocessed) a checkpoint.
     *
     * This event is not tied to clock events, but rather tied to generation (or regeneration) of state.
     * This event is guaranteed to be called after _any_ checkpoint is processed, including skip-slot checkpoints, checkpoints that are formed as a result of processing blocks, etc.
     */
    ChainEvent["checkpoint"] = "checkpoint";
    /**
     * This event signals that the chain has processed (or reprocessed) a checkpoint state with an updated justified checkpoint.
     *
     * This event is a derivative of the `checkpoint` event. Eg: in cases where the `checkpoint` state has an updated justified checkpoint, this event is triggered.
     */
    ChainEvent["justified"] = "justified";
    /**
     * This event signals that the chain has processed (or reprocessed) a checkpoint state with an updated finalized checkpoint.
     *
     * This event is a derivative of the `checkpoint` event. Eg: in cases where the `checkpoint` state has an updated finalized checkpoint, this event is triggered.
     */
    ChainEvent["finalized"] = "finalized";
    /**
     * This event signals the start of a new slot, and that subsequent calls to `clock.currentSlot` will equal `slot`.
     *
     * This event is guaranteed to be emitted every `SECONDS_PER_SLOT` seconds.
     */
    ChainEvent["clockSlot"] = "clock:slot";
    /**
     * This event signals the start of a new epoch, and that subsequent calls to `clock.currentEpoch` will return `epoch`.
     *
     * This event is guaranteed to be emitted every `SECONDS_PER_SLOT * SLOTS_PER_EPOCH` seconds.
     */
    ChainEvent["clockEpoch"] = "clock:epoch";
    /**
     * This event signals that the fork choice has been updated to a new head.
     *
     * This event is guaranteed to be emitted after every sucessfully processed block, if that block updates the head.
     */
    ChainEvent["forkChoiceHead"] = "forkChoice:head";
    /**
     * This event signals that the fork choice has been updated to a new head that is not a descendant of the previous head.
     *
     * This event is guaranteed to be emitted after every sucessfully processed block, if that block results results in a reorg.
     */
    ChainEvent["forkChoiceReorg"] = "forkChoice:reorg";
    /**
     * This event signals that the fork choice store has been updated.
     *
     * This event is guaranteed to be triggered whenever the fork choice justified checkpoint is updated. This is either in response to a newly processed block or a new clock tick.
     */
    ChainEvent["forkChoiceJustified"] = "forkChoice:justified";
    /**
     * This event signals that the fork choice store has been updated.
     *
     * This event is guaranteed to be triggered whenever the fork choice justified checkpoint is updated. This is in response to a newly processed block.
     */
    ChainEvent["forkChoiceFinalized"] = "forkChoice:finalized";
    /**
     * This event signals that the chain has errored while processing an attestation.
     *
     * This event is guaranteed to be triggered after any attestation fed to the chain fails at any stage of processing.
     */
    ChainEvent["errorAttestation"] = "error:attestation";
    /**
     * This event signals that the chain has errored while processing a block.
     *
     * This event is guaranteed to be triggered after any block fed to the chain fails at any stage of processing.
     */
    ChainEvent["errorBlock"] = "error:block";
    /**
     * A new lightclient header update is available to be broadcasted to connected light-clients
     */
    ChainEvent["lightclientHeaderUpdate"] = "lightclient:header_update";
})(ChainEvent = exports.ChainEvent || (exports.ChainEvent = {}));
/**
 * Emits important chain events that occur during normal chain operation.
 *
 * Chain events can be broken into several categories:
 * - Clock: the chain's clock is updated
 * - Fork Choice: the chain's fork choice is updated
 * - Processing: the chain processes attestations and blocks, either successfully or with an error
 * - Checkpointing: the chain processes epoch boundaries
 */
class ChainEventEmitter extends events_1.EventEmitter {
}
exports.ChainEventEmitter = ChainEventEmitter;
//# sourceMappingURL=emitter.js.map