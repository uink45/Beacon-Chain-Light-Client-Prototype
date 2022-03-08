"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSyncCommitteeUpdates = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const bls_1 = require("@chainsafe/bls");
const seed_1 = require("../../util/seed");
/**
 * Rotate nextSyncCommittee to currentSyncCommittee if sync committee period is over.
 *
 * PERF: Once every `EPOCHS_PER_SYNC_COMMITTEE_PERIOD`, do an expensive operation to compute the next committee.
 * Calculating the next sync committee has a proportional cost to $VALIDATOR_COUNT
 */
function processSyncCommitteeUpdates(state) {
    const nextEpoch = state.epochCtx.epoch + 1;
    if (nextEpoch % lodestar_params_1.EPOCHS_PER_SYNC_COMMITTEE_PERIOD === 0) {
        const activeValidatorIndices = state.epochCtx.nextShuffling.activeIndices;
        const { effectiveBalanceIncrements } = state.epochCtx;
        const nextSyncCommitteeIndices = (0, seed_1.getNextSyncCommitteeIndices)(state, activeValidatorIndices, effectiveBalanceIncrements);
        // Using the index2pubkey cache is slower because it needs the serialized pubkey.
        const nextSyncCommitteePubkeys = nextSyncCommitteeIndices.map((index) => state.validators[index].pubkey.valueOf());
        // Rotate syncCommittee in state
        state.currentSyncCommittee = state.nextSyncCommittee;
        state.nextSyncCommittee = {
            pubkeys: nextSyncCommitteePubkeys,
            aggregatePubkey: (0, bls_1.aggregatePublicKeys)(nextSyncCommitteePubkeys),
        };
        state.epochCtx.rotateSyncCommitteeIndexed(nextSyncCommitteeIndices);
    }
}
exports.processSyncCommitteeUpdates = processSyncCommitteeUpdates;
//# sourceMappingURL=processSyncCommitteeUpdates.js.map