"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSlashingsAllForks = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const ssz_1 = require("@chainsafe/ssz");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const util_1 = require("../../util");
/**
 * Update validator registry for validators that activate + exit
 *
 * PERF: Cost 'proportional' to only validators that are slashed. For mainnet conditions:
 * - indicesToSlash: max len is 8704. But it's very unlikely since it would require all validators on the same
 *   committees to sign slashable attestations.
 *
 * - On normal mainnet conditions indicesToSlash = 0
 */
function processSlashingsAllForks(fork, state, process) {
    // No need to compute totalSlashings if there no index to slash
    if (process.indicesToSlash.length === 0) {
        return;
    }
    // TODO: have the regular totalBalance in EpochProcess too?
    const totalBalance = BigInt(process.totalActiveStakeByIncrement) * BigInt(lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT);
    // TODO: could totalSlashings be number?
    const totalSlashings = Array.from((0, ssz_1.readonlyValues)(state.slashings)).reduce((a, b) => a + b, BigInt(0));
    const proportionalSlashingMultiplier = fork === lodestar_params_1.ForkName.phase0
        ? lodestar_params_1.PROPORTIONAL_SLASHING_MULTIPLIER
        : fork === lodestar_params_1.ForkName.altair
            ? lodestar_params_1.PROPORTIONAL_SLASHING_MULTIPLIER_ALTAIR
            : lodestar_params_1.PROPORTIONAL_SLASHING_MULTIPLIER_BELLATRIX;
    const { effectiveBalanceIncrements } = state.epochCtx;
    const adjustedTotalSlashingBalance = (0, lodestar_utils_1.bigIntMin)(totalSlashings * BigInt(proportionalSlashingMultiplier), totalBalance);
    const increment = lodestar_params_1.EFFECTIVE_BALANCE_INCREMENT;
    for (const index of process.indicesToSlash) {
        const effectiveBalanceIncrement = effectiveBalanceIncrements[index];
        const penaltyNumerator = BigInt(effectiveBalanceIncrement) * adjustedTotalSlashingBalance;
        const penalty = Number(penaltyNumerator / totalBalance) * increment;
        (0, util_1.decreaseBalance)(state, index, penalty);
    }
}
exports.processSlashingsAllForks = processSlashingsAllForks;
//# sourceMappingURL=processSlashings.js.map