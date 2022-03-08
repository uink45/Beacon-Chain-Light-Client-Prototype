"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeEpochShuffling = exports.computeCommitteeCount = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const _1 = require(".");
function computeCommitteeCount(activeValidatorCount) {
    const validatorsPerSlot = (0, lodestar_utils_1.intDiv)(activeValidatorCount, lodestar_params_1.SLOTS_PER_EPOCH);
    const committeesPerSlot = (0, lodestar_utils_1.intDiv)(validatorsPerSlot, lodestar_params_1.TARGET_COMMITTEE_SIZE);
    return Math.max(1, Math.min(lodestar_params_1.MAX_COMMITTEES_PER_SLOT, committeesPerSlot));
}
exports.computeCommitteeCount = computeCommitteeCount;
function computeEpochShuffling(state, activeIndices, epoch) {
    const seed = (0, _1.getSeed)(state, epoch, lodestar_params_1.DOMAIN_BEACON_ATTESTER);
    // copy
    const shuffling = activeIndices.slice();
    (0, _1.unshuffleList)(shuffling, seed);
    const activeValidatorCount = activeIndices.length;
    const committeesPerSlot = computeCommitteeCount(activeValidatorCount);
    const committeeCount = committeesPerSlot * lodestar_params_1.SLOTS_PER_EPOCH;
    const committees = [];
    for (let slot = 0; slot < lodestar_params_1.SLOTS_PER_EPOCH; slot++) {
        const slotCommittees = [];
        for (let committeeIndex = 0; committeeIndex < committeesPerSlot; committeeIndex++) {
            const index = slot * committeesPerSlot + committeeIndex;
            const startOffset = Math.floor((activeValidatorCount * index) / committeeCount);
            const endOffset = Math.floor((activeValidatorCount * (index + 1)) / committeeCount);
            if (!(startOffset <= endOffset)) {
                throw new Error(`Invalid offsets: start ${startOffset} must be less than or equal end ${endOffset}`);
            }
            slotCommittees.push(shuffling.slice(startOffset, endOffset));
        }
        committees.push(slotCommittees);
    }
    return {
        epoch,
        activeIndices,
        shuffling,
        committees,
        committeesPerSlot,
    };
}
exports.computeEpochShuffling = computeEpochShuffling;
//# sourceMappingURL=epochShuffling.js.map