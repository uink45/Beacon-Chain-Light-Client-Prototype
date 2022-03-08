"use strict";
/**
 * @module chain/stateTransition/util
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChurnLimit = exports.getActiveValidatorIndices = exports.isSlashableValidator = exports.isActiveValidator = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
/**
 * Check if [[validator]] is active
 */
function isActiveValidator(validator, epoch) {
    return validator.activationEpoch <= epoch && epoch < validator.exitEpoch;
}
exports.isActiveValidator = isActiveValidator;
/**
 * Check if [[validator]] is slashable
 */
function isSlashableValidator(validator, epoch) {
    return !validator.slashed && validator.activationEpoch <= epoch && epoch < validator.withdrawableEpoch;
}
exports.isSlashableValidator = isSlashableValidator;
/**
 * Return the sequence of active validator indices at [[epoch]].
 *
 * NAIVE - SLOW CODE 🐢
 */
function getActiveValidatorIndices(state, epoch) {
    const indices = [];
    let index = 0;
    for (const validator of (0, ssz_1.readonlyValues)(state.validators)) {
        if (isActiveValidator(validator, epoch)) {
            indices.push(index);
        }
        index++;
    }
    return indices;
}
exports.getActiveValidatorIndices = getActiveValidatorIndices;
function getChurnLimit(config, activeValidatorCount) {
    return Math.max(config.MIN_PER_EPOCH_CHURN_LIMIT, (0, lodestar_utils_1.intDiv)(activeValidatorCount, config.CHURN_LIMIT_QUOTIENT));
}
exports.getChurnLimit = getChurnLimit;
//# sourceMappingURL=validator.js.map