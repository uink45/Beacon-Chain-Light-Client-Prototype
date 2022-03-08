"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onErrorBlock = exports.onErrorAttestation = exports.onBlock = exports.onAttestation = exports.onForkChoiceReorg = exports.onForkChoiceHead = exports.onForkChoiceFinalized = exports.onForkChoiceJustified = exports.onFinalized = exports.onJustified = exports.onCheckpoint = exports.onForkVersion = exports.onClockEpoch = exports.onClockSlot = exports.handleChainEvents = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const errors_1 = require("./errors");
const emitter_1 = require("./emitter");
const reprocess_1 = require("./reprocess");
const stateCache_1 = require("./stateCache");
/**
 * Returns a function that runs an async handler function with input args,
 * If the handler function successfully completes,
 * then emits the event on the event emitter using the same args
 */
function wrapHandler(event, logger, handler) {
    return async (...args) => {
        try {
            await handler(...args);
        }
        catch (e) {
            logger.error("Error handling event", { event }, e);
        }
    };
}
/**
 * Attach ChainEventEmitter event handlers
 * Listen on `signal` to remove event handlers
 */
function handleChainEvents(signal) {
    const handlersObj = {
        [emitter_1.ChainEvent.attestation]: onAttestation,
        [emitter_1.ChainEvent.block]: onBlock,
        [emitter_1.ChainEvent.checkpoint]: onCheckpoint,
        [emitter_1.ChainEvent.clockEpoch]: onClockEpoch,
        [emitter_1.ChainEvent.clockSlot]: onClockSlot,
        [emitter_1.ChainEvent.errorAttestation]: onErrorAttestation,
        [emitter_1.ChainEvent.errorBlock]: onErrorBlock,
        [emitter_1.ChainEvent.finalized]: onFinalized,
        [emitter_1.ChainEvent.forkChoiceFinalized]: onForkChoiceFinalized,
        [emitter_1.ChainEvent.forkChoiceHead]: onForkChoiceHead,
        [emitter_1.ChainEvent.forkChoiceJustified]: onForkChoiceJustified,
        [emitter_1.ChainEvent.forkChoiceReorg]: onForkChoiceReorg,
        [emitter_1.ChainEvent.justified]: onJustified,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        [emitter_1.ChainEvent.lightclientHeaderUpdate]: () => { },
    };
    const emitter = this.emitter;
    const logger = this.logger;
    const onAbort = [];
    for (const [eventStr, handler] of Object.entries(handlersObj)) {
        const event = eventStr;
        const wrappedHandler = wrapHandler(event, logger, handler.bind(this));
        emitter.on(event, wrappedHandler);
        onAbort.push(() => emitter.off(event, wrappedHandler));
    }
    signal.addEventListener("abort", () => {
        for (const fn of onAbort)
            fn();
    }, { once: true });
}
exports.handleChainEvents = handleChainEvents;
async function onClockSlot(slot) {
    var _a;
    this.logger.verbose("Clock slot", { slot });
    // CRITICAL UPDATE
    this.forkChoice.updateTime(slot);
    (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.clockSlot.set(slot);
    this.attestationPool.prune(slot);
    this.aggregatedAttestationPool.prune(slot);
    this.syncCommitteeMessagePool.prune(slot);
    this.seenSyncCommitteeMessages.prune(slot);
    this.reprocessController.onSlot(slot);
}
exports.onClockSlot = onClockSlot;
function onClockEpoch(currentEpoch) {
    this.seenAttesters.prune(currentEpoch);
    this.seenAggregators.prune(currentEpoch);
}
exports.onClockEpoch = onClockEpoch;
function onForkVersion(version) {
    this.logger.verbose("New fork version", (0, ssz_1.toHexString)(version));
}
exports.onForkVersion = onForkVersion;
function onCheckpoint(cp, state) {
    var _a;
    this.logger.verbose("Checkpoint processed", (0, stateCache_1.toCheckpointHex)(cp));
    (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.currentValidators.set({ status: "active" }, state.currentShuffling.activeIndices.length);
    const parentBlockSummary = this.forkChoice.getBlock(state.latestBlockHeader.parentRoot);
    if (parentBlockSummary) {
        const justifiedCheckpoint = state.currentJustifiedCheckpoint;
        const justifiedEpoch = justifiedCheckpoint.epoch;
        const preJustifiedEpoch = parentBlockSummary.justifiedEpoch;
        if (justifiedEpoch > preJustifiedEpoch) {
            this.emitter.emit(emitter_1.ChainEvent.justified, justifiedCheckpoint, state);
        }
        const finalizedCheckpoint = state.finalizedCheckpoint;
        const finalizedEpoch = finalizedCheckpoint.epoch;
        const preFinalizedEpoch = parentBlockSummary.finalizedEpoch;
        if (finalizedEpoch > preFinalizedEpoch) {
            this.emitter.emit(emitter_1.ChainEvent.finalized, finalizedCheckpoint, state);
        }
    }
}
exports.onCheckpoint = onCheckpoint;
function onJustified(cp, state) {
    var _a, _b;
    this.logger.verbose("Checkpoint justified", (0, stateCache_1.toCheckpointHex)(cp));
    (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.previousJustifiedEpoch.set(state.previousJustifiedCheckpoint.epoch);
    (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.currentJustifiedEpoch.set(cp.epoch);
}
exports.onJustified = onJustified;
async function onFinalized(cp) {
    var _a;
    this.logger.verbose("Checkpoint finalized", (0, stateCache_1.toCheckpointHex)(cp));
    (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.finalizedEpoch.set(cp.epoch);
}
exports.onFinalized = onFinalized;
function onForkChoiceJustified(cp) {
    this.logger.verbose("Fork choice justified", { epoch: cp.epoch, root: cp.rootHex });
}
exports.onForkChoiceJustified = onForkChoiceJustified;
async function onForkChoiceFinalized(cp) {
    this.logger.verbose("Fork choice finalized", { epoch: cp.epoch, root: cp.rootHex });
    this.seenBlockProposers.prune((0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(cp.epoch));
    // TODO: Improve using regen here
    const headState = this.stateCache.get(this.forkChoice.getHead().stateRoot);
    if (headState) {
        this.opPool.pruneAll(headState);
    }
}
exports.onForkChoiceFinalized = onForkChoiceFinalized;
function onForkChoiceHead(head) {
    var _a;
    this.logger.verbose("New chain head", {
        headSlot: head.slot,
        headRoot: head.blockRoot,
    });
    this.syncContributionAndProofPool.prune(head.slot);
    this.seenContributionAndProof.prune(head.slot);
    (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.headSlot.set(head.slot);
}
exports.onForkChoiceHead = onForkChoiceHead;
function onForkChoiceReorg(head, oldHead, depth) {
    this.logger.verbose("Chain reorg", { depth });
}
exports.onForkChoiceReorg = onForkChoiceReorg;
function onAttestation(attestation) {
    this.logger.debug("Attestation processed", {
        slot: attestation.data.slot,
        index: attestation.data.index,
        targetRoot: (0, ssz_1.toHexString)(attestation.data.target.root),
        aggregationBits: lodestar_types_1.ssz.phase0.CommitteeBits.toJson(attestation.aggregationBits),
    });
}
exports.onAttestation = onAttestation;
async function onBlock(block, _postState) {
    const blockRoot = (0, ssz_1.toHexString)(this.config.getForkTypes(block.message.slot).BeaconBlock.hashTreeRoot(block.message));
    const advancedSlot = this.clock.slotWithFutureTolerance(reprocess_1.REPROCESS_MIN_TIME_TO_NEXT_SLOT_SEC);
    this.reprocessController.onBlockImported({ slot: block.message.slot, root: blockRoot }, advancedSlot);
    this.logger.verbose("Block processed", {
        slot: block.message.slot,
        root: blockRoot,
    });
}
exports.onBlock = onBlock;
async function onErrorAttestation(err) {
    if (!(err instanceof errors_1.AttestationError)) {
        this.logger.error("Non AttestationError received", {}, err);
        return;
    }
    this.logger.debug("Attestation error", {}, err);
}
exports.onErrorAttestation = onErrorAttestation;
async function onErrorBlock(err) {
    if (!(err instanceof errors_1.BlockError)) {
        this.logger.error("Non BlockError received", {}, err);
        return;
    }
    // err type data may contain CachedBeaconState which is too much to log
    const slimError = new Error();
    slimError.message = err.message;
    slimError.stack = err.stack;
    this.logger.error("Block error", { slot: err.signedBlock.message.slot, errCode: err.type.code }, err);
    if (err.type.code === errors_1.BlockErrorCode.INVALID_SIGNATURE) {
        const { signedBlock } = err;
        const blockSlot = signedBlock.message.slot;
        const { state } = err.type;
        const blockPath = this.persistInvalidSszObject("signedBlock", this.config.getForkTypes(blockSlot).SignedBeaconBlock.serialize(signedBlock), `${blockSlot}_invalid_signature`);
        const statePath = this.persistInvalidSszObject("state", state.serialize(), `${state.slot}_invalid_signature`);
        this.logger.debug("Invalid signature block and state were written to disc", { blockPath, statePath });
    }
    else if (err.type.code === errors_1.BlockErrorCode.INVALID_STATE_ROOT) {
        const { signedBlock } = err;
        const blockSlot = signedBlock.message.slot;
        const { preState, postState } = err.type;
        const invalidRoot = (0, ssz_1.toHexString)(postState.hashTreeRoot());
        const blockPath = this.persistInvalidSszObject("signedBlock", this.config.getForkTypes(blockSlot).SignedBeaconBlock.serialize(signedBlock), `${blockSlot}_invalid_state_root_${invalidRoot}`);
        const preStatePath = this.persistInvalidSszObject("state", preState.serialize(), `${blockSlot}_invalid_state_root_preState_${invalidRoot}`);
        const postStatePath = this.persistInvalidSszObject("state", postState.serialize(), `${blockSlot}_invalid_state_root_postState_${invalidRoot}`);
        this.logger.debug("Invalid state root block and states were written to disc", {
            blockPath,
            preStatePath,
            postStatePath,
        });
    }
}
exports.onErrorBlock = onErrorBlock;
//# sourceMappingURL=eventHandlers.js.map