"use strict";
/**
 * @module chain/stateTransition/util
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeed = exports.getRandaoMix = exports.computeShuffledIndex = exports.getNextSyncCommitteeIndices = exports.computeProposerIndex = exports.computeProposers = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const epoch_1 = require("./epoch");
const epoch_2 = require("./epoch");
/**
 * Compute proposer indices for an epoch
 */
function computeProposers(state, shuffling, effectiveBalanceIncrements) {
    const epochSeed = getSeed(state, shuffling.epoch, lodestar_params_1.DOMAIN_BEACON_PROPOSER);
    const startSlot = (0, epoch_1.computeStartSlotAtEpoch)(shuffling.epoch);
    const proposers = [];
    for (let slot = startSlot; slot < startSlot + lodestar_params_1.SLOTS_PER_EPOCH; slot++) {
        proposers.push(computeProposerIndex(effectiveBalanceIncrements, shuffling.activeIndices, (0, ssz_1.hash)(Buffer.concat([epochSeed, (0, lodestar_utils_1.intToBytes)(slot, 8)]))));
    }
    return proposers;
}
exports.computeProposers = computeProposers;
/**
 * Return from ``indices`` a random index sampled by effective balance.
 *
 * SLOW CODE - 🐢
 */
function computeProposerIndex(effectiveBalanceIncrements, indices, seed) {
    lodestar_utils_1.assert.gt(indices.length, 0, "Validator indices must not be empty");
    // TODO: Inline outside this function
    const MAX_RANDOM_BYTE = 2 ** 8 - 1;
    const MAX_EFFECTIVE_BALANCE_INCREMENT = lodestar_params_1.MAX_EFFECTIVE_BALANCE / lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT;
    let i = 0;
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
        const candidateIndex = indices[computeShuffledIndex(i % indices.length, indices.length, seed)];
        const randByte = (0, ssz_1.hash)(Buffer.concat([
            seed,
            //
            (0, lodestar_utils_1.intToBytes)(Math.floor(i / 32), 8, "le"),
        ]))[i % 32];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const effectiveBalanceIncrement = effectiveBalanceIncrements[candidateIndex];
        if (effectiveBalanceIncrement * MAX_RANDOM_BYTE >= MAX_EFFECTIVE_BALANCE_INCREMENT * randByte) {
            return candidateIndex;
        }
        i += 1;
        if (i === indices.length) {
            return -1;
        }
    }
}
exports.computeProposerIndex = computeProposerIndex;
/**
 * TODO: NAIVE
 *
 * Return the sync committee indices for a given state and epoch.
 * Aligns `epoch` to `baseEpoch` so the result is the same with any `epoch` within a sync period.
 *  Note: This function should only be called at sync committee period boundaries, as
 *  ``get_sync_committee_indices`` is not stable within a given period.
 *
 * SLOW CODE - 🐢
 */
function getNextSyncCommitteeIndices(state, activeValidatorIndices, effectiveBalanceIncrements) {
    // TODO: Bechmark if it's necessary to inline outside of this function
    const MAX_RANDOM_BYTE = 2 ** 8 - 1;
    const MAX_EFFECTIVE_BALANCE_INCREMENT = lodestar_params_1.MAX_EFFECTIVE_BALANCE / lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT;
    const epoch = (0, epoch_2.computeEpochAtSlot)(state.slot) + 1;
    const activeValidatorCount = activeValidatorIndices.length;
    const seed = getSeed(state, epoch, lodestar_params_1.DOMAIN_SYNC_COMMITTEE);
    let i = 0;
    const syncCommitteeIndices = [];
    while (syncCommitteeIndices.length < lodestar_params_1.SYNC_COMMITTEE_SIZE) {
        const shuffledIndex = computeShuffledIndex(i % activeValidatorCount, activeValidatorCount, seed);
        const candidateIndex = activeValidatorIndices[shuffledIndex];
        const randByte = (0, ssz_1.hash)(Buffer.concat([
            seed,
            //
            (0, lodestar_utils_1.intToBytes)(Math.floor(i / 32), 8, "le"),
        ]))[i % 32];
        const effectiveBalanceIncrement = effectiveBalanceIncrements[candidateIndex];
        if (effectiveBalanceIncrement * MAX_RANDOM_BYTE >= MAX_EFFECTIVE_BALANCE_INCREMENT * randByte) {
            syncCommitteeIndices.push(candidateIndex);
        }
        i++;
    }
    return syncCommitteeIndices;
}
exports.getNextSyncCommitteeIndices = getNextSyncCommitteeIndices;
/**
 * Return the shuffled validator index corresponding to ``seed`` (and ``index_count``).
 *
 * Swap or not
 * https://link.springer.com/content/pdf/10.1007%2F978-3-642-32009-5_1.pdf
 *
 * See the 'generalized domain' algorithm on page 3.
 */
function computeShuffledIndex(index, indexCount, seed) {
    let permuted = index;
    lodestar_utils_1.assert.lt(index, indexCount, "indexCount must be less than index");
    lodestar_utils_1.assert.lte(indexCount, 2 ** 40, "indexCount too big");
    const _seed = seed.valueOf();
    for (let i = 0; i < lodestar_params_1.SHUFFLE_ROUND_COUNT; i++) {
        const pivot = Number((0, lodestar_utils_1.bytesToBigInt)((0, ssz_1.hash)(Buffer.concat([_seed, (0, lodestar_utils_1.intToBytes)(i, 1)])).slice(0, 8)) % BigInt(indexCount));
        const flip = (pivot + indexCount - permuted) % indexCount;
        const position = Math.max(permuted, flip);
        const source = (0, ssz_1.hash)(Buffer.concat([_seed, (0, lodestar_utils_1.intToBytes)(i, 1), (0, lodestar_utils_1.intToBytes)(Math.floor(position / 256), 4)]));
        const byte = source[Math.floor((position % 256) / 8)];
        const bit = (byte >> position % 8) % 2;
        permuted = bit ? flip : permuted;
    }
    return permuted;
}
exports.computeShuffledIndex = computeShuffledIndex;
/**
 * Return the randao mix at a recent [[epoch]].
 */
function getRandaoMix(state, epoch) {
    return state.randaoMixes[epoch % lodestar_params_1.EPOCHS_PER_HISTORICAL_VECTOR];
}
exports.getRandaoMix = getRandaoMix;
/**
 * Return the seed at [[epoch]].
 */
function getSeed(state, epoch, domainType) {
    const mix = getRandaoMix(state, epoch + lodestar_params_1.EPOCHS_PER_HISTORICAL_VECTOR - lodestar_params_1.MIN_SEED_LOOKAHEAD - 1);
    return (0, ssz_1.hash)(Buffer.concat([domainType, (0, lodestar_utils_1.intToBytes)(epoch, 8), mix.valueOf()]));
}
exports.getSeed = getSeed;
//# sourceMappingURL=seed.js.map