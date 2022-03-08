"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidVoluntaryExit = exports.processVoluntaryExitAllForks = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const util_1 = require("../../util");
const block_1 = require("../../allForks/block");
const signatureSets_1 = require("../../allForks/signatureSets");
/**
 * Process a VoluntaryExit operation. Initiates the exit of a validator.
 *
 * PERF: Work depends on number of VoluntaryExit per block. On regular networks the average is 0 / block.
 */
function processVoluntaryExitAllForks(state, signedVoluntaryExit, verifySignature = true) {
    if (!isValidVoluntaryExit(state, signedVoluntaryExit, verifySignature)) {
        throw Error("Invalid voluntary exit");
    }
    const validator = state.validators[signedVoluntaryExit.message.validatorIndex];
    (0, block_1.initiateValidatorExit)(state, validator);
}
exports.processVoluntaryExitAllForks = processVoluntaryExitAllForks;
function isValidVoluntaryExit(state, signedVoluntaryExit, verifySignature = true) {
    const { config, epochCtx } = state;
    const voluntaryExit = signedVoluntaryExit.message;
    const validator = state.validators[voluntaryExit.validatorIndex];
    const currentEpoch = epochCtx.currentShuffling.epoch;
    return (
    // verify the validator is active
    (0, util_1.isActiveValidator)(validator, currentEpoch) &&
        // verify exit has not been initiated
        validator.exitEpoch === lodestar_params_1.FAR_FUTURE_EPOCH &&
        // exits must specify an epoch when they become valid; they are not valid before then
        currentEpoch >= voluntaryExit.epoch &&
        // verify the validator had been active long enough
        currentEpoch >= validator.activationEpoch + config.SHARD_COMMITTEE_PERIOD &&
        // verify signature
        (!verifySignature || (0, signatureSets_1.verifyVoluntaryExitSignature)(state, signedVoluntaryExit)));
}
exports.isValidVoluntaryExit = isValidVoluntaryExit;
//# sourceMappingURL=processVoluntaryExit.js.map