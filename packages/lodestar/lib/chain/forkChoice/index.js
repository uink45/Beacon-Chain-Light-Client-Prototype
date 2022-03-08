"use strict";
/**
 * @module chain/forkChoice
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeForkChoice = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_fork_choice_1 = require("@chainsafe/lodestar-fork-choice");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const initState_1 = require("../initState");
const emitter_1 = require("../emitter");
const constants_1 = require("../../constants");
/**
 * Fork Choice extended with a ChainEventEmitter
 */
function initializeForkChoice(config, emitter, currentSlot, state, proposerBoostEnabled, metrics) {
    const { blockHeader, checkpoint } = (0, initState_1.computeAnchorCheckpoint)(config, state);
    const finalizedCheckpoint = { ...checkpoint };
    const justifiedCheckpoint = {
        ...checkpoint,
        // If not genesis epoch, justified checkpoint epoch must be set to finalized checkpoint epoch + 1
        // So that we don't allow the chain to initially justify with a block that isn't also finalizing the anchor state.
        // If that happens, we will create an invalid head state,
        // with the head not matching the fork choice justified and finalized epochs.
        epoch: checkpoint.epoch === 0 ? checkpoint.epoch : checkpoint.epoch + 1,
    };
    const justifiedBalances = (0, lodestar_beacon_state_transition_1.getEffectiveBalanceIncrementsZeroInactive)(state);
    return new lodestar_fork_choice_1.ForkChoice(config, new lodestar_fork_choice_1.ForkChoiceStore(currentSlot, justifiedCheckpoint, finalizedCheckpoint, {
        onJustified: (cp) => emitter.emit(emitter_1.ChainEvent.forkChoiceJustified, cp),
        onFinalized: (cp) => emitter.emit(emitter_1.ChainEvent.forkChoiceFinalized, cp),
    }), lodestar_fork_choice_1.ProtoArray.initialize({
        slot: blockHeader.slot,
        parentRoot: (0, ssz_1.toHexString)(blockHeader.parentRoot),
        stateRoot: (0, ssz_1.toHexString)(blockHeader.stateRoot),
        blockRoot: (0, ssz_1.toHexString)(checkpoint.root),
        justifiedEpoch: justifiedCheckpoint.epoch,
        justifiedRoot: (0, ssz_1.toHexString)(justifiedCheckpoint.root),
        finalizedEpoch: finalizedCheckpoint.epoch,
        finalizedRoot: (0, ssz_1.toHexString)(finalizedCheckpoint.root),
        ...(lodestar_beacon_state_transition_1.bellatrix.isBellatrixStateType(state) && lodestar_beacon_state_transition_1.bellatrix.isMergeTransitionComplete(state)
            ? {
                executionPayloadBlockHash: (0, ssz_1.toHexString)(state.latestExecutionPayloadHeader.blockHash),
                executionStatus: blockHeader.slot === constants_1.GENESIS_SLOT ? lodestar_fork_choice_1.ExecutionStatus.Valid : lodestar_fork_choice_1.ExecutionStatus.Syncing,
            }
            : { executionPayloadBlockHash: null, executionStatus: lodestar_fork_choice_1.ExecutionStatus.PreMerge }),
    }), justifiedBalances, proposerBoostEnabled, metrics);
}
exports.initializeForkChoice = initializeForkChoice;
//# sourceMappingURL=index.js.map