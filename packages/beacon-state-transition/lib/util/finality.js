"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInInactivityLeak = exports.getFinalityDelay = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
function getFinalityDelay(state) {
    return state.previousShuffling.epoch - state.finalizedCheckpoint.epoch;
}
exports.getFinalityDelay = getFinalityDelay;
/**
 * If the chain has not been finalized for >4 epochs, the chain enters an "inactivity leak" mode,
 * where inactive validators get progressively penalized more and more, to reduce their influence
 * until blocks get finalized again. See here (https://github.com/ethereum/annotated-spec/blob/master/phase0/beacon-chain.md#inactivity-quotient) for what the inactivity leak is, what it's for and how
 * it works.
 */
function isInInactivityLeak(state) {
    return getFinalityDelay(state) > lodestar_params_1.MIN_EPOCHS_TO_INACTIVITY_PENALTY;
}
exports.isInInactivityLeak = isInInactivityLeak;
//# sourceMappingURL=finality.js.map