"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attesterShufflingDecisionRoot = exports.proposerShufflingDecisionRoot = void 0;
const blockRoot_1 = require("./blockRoot");
const epoch_1 = require("./epoch");
/**
 * Returns the block root which decided the proposer shuffling for the current epoch. This root
 * can be used to key this proposer shuffling.
 *
 * Returns `null` on the one-off scenario where the genesis block decides its own shuffling.
 * It should be set to the latest block applied to this `state` or the genesis block root.
 */
function proposerShufflingDecisionRoot(state) {
    const decisionSlot = proposerShufflingDecisionSlot(state);
    if (state.slot == decisionSlot) {
        return null;
    }
    else {
        return (0, blockRoot_1.getBlockRootAtSlot)(state, decisionSlot);
    }
}
exports.proposerShufflingDecisionRoot = proposerShufflingDecisionRoot;
/**
 * Returns the slot at which the proposer shuffling was decided. The block root at this slot
 * can be used to key the proposer shuffling for the current epoch.
 */
function proposerShufflingDecisionSlot(state) {
    const startSlot = (0, epoch_1.computeStartSlotAtEpoch)(state.currentShuffling.epoch);
    return Math.max(startSlot - 1, 0);
}
/**
 * Returns the block root which decided the attester shuffling for the given `requestedEpoch`.
 * This root can be used to key that attester shuffling.
 *
 * Returns `null` on the one-off scenario where the genesis block decides its own shuffling.
 * It should be set to the latest block applied to this `state` or the genesis block root.
 */
function attesterShufflingDecisionRoot(state, requestedEpoch) {
    const decisionSlot = attesterShufflingDecisionSlot(state, requestedEpoch);
    if (state.slot == decisionSlot) {
        return null;
    }
    else {
        return (0, blockRoot_1.getBlockRootAtSlot)(state, decisionSlot);
    }
}
exports.attesterShufflingDecisionRoot = attesterShufflingDecisionRoot;
/**
 * Returns the slot at which the proposer shuffling was decided. The block root at this slot
 * can be used to key the proposer shuffling for the current epoch.
 */
function attesterShufflingDecisionSlot(state, requestedEpoch) {
    const epoch = attesterShufflingDecisionEpoch(state, requestedEpoch);
    const slot = (0, epoch_1.computeStartSlotAtEpoch)(epoch);
    return Math.max(slot - 1, 0);
}
/**
 * Returns the epoch at which the attester shuffling was decided.
 *
 * Spec ref: https://github.com/ethereum/eth2.0-APIs/blob/46d2b82127cb1ffce51bbc748a7df2677fc0215a/apis/validator/duties/attester.yaml#L15
 *
 * Throws an error when:
 * - `EpochTooLow` when `requestedEpoch` is more than 1 prior to `currentEpoch`.
 * - `EpochTooHigh` when `requestedEpoch` is more than 1 after `currentEpoch`.
 */
function attesterShufflingDecisionEpoch(state, requestedEpoch) {
    const currentEpoch = state.currentShuffling.epoch;
    const previouEpoch = state.previousShuffling.epoch;
    // Next
    if (requestedEpoch === currentEpoch + 1)
        return currentEpoch;
    // Current
    if (requestedEpoch === currentEpoch)
        return previouEpoch;
    // Previous
    if (requestedEpoch === currentEpoch - 1)
        return Math.max(previouEpoch - 1, 0);
    if (requestedEpoch < currentEpoch) {
        throw Error(`EpochTooLow: current ${currentEpoch} requested ${requestedEpoch}`);
    }
    else {
        throw Error(`EpochTooHigh: current ${currentEpoch} requested ${requestedEpoch}`);
    }
}
//# sourceMappingURL=shufflingDecisionRoot.js.map