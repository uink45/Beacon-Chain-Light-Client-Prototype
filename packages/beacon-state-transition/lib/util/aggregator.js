"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSelectionProofValid = exports.isAggregatorFromCommitteeLength = exports.isSyncCommitteeAggregator = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const ZERO_BIGINT = BigInt(0);
function isSyncCommitteeAggregator(selectionProof) {
    const modulo = Math.max(1, (0, lodestar_utils_1.intDiv)((0, lodestar_utils_1.intDiv)(lodestar_params_1.SYNC_COMMITTEE_SIZE, lodestar_params_1.SYNC_COMMITTEE_SUBNET_COUNT), lodestar_params_1.TARGET_AGGREGATORS_PER_SYNC_SUBCOMMITTEE));
    return isSelectionProofValid(selectionProof, modulo);
}
exports.isSyncCommitteeAggregator = isSyncCommitteeAggregator;
function isAggregatorFromCommitteeLength(committeeLength, slotSignature) {
    const modulo = Math.max(1, (0, lodestar_utils_1.intDiv)(committeeLength, lodestar_params_1.TARGET_AGGREGATORS_PER_COMMITTEE));
    return isSelectionProofValid(slotSignature, modulo);
}
exports.isAggregatorFromCommitteeLength = isAggregatorFromCommitteeLength;
/**
 * Note: **must** use bytesToBigInt() otherwise a JS number is not able to represent the latest digits of
 * the remainder, resulting in `14333559117764833000` for example, where the last three digits are always zero.
 * Using bytesToInt() may cause isSelectionProofValid() to always return false.
 */
function isSelectionProofValid(sig, modulo) {
    return (0, lodestar_utils_1.bytesToBigInt)((0, ssz_1.hash)(sig.valueOf()).slice(0, 8)) % BigInt(modulo) === ZERO_BIGINT;
}
exports.isSelectionProofValid = isSelectionProofValid;
//# sourceMappingURL=aggregator.js.map