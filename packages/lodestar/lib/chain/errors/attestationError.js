"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttestationError = exports.AttestationErrorCode = void 0;
const ssz_1 = require("@chainsafe/ssz");
const gossipValidation_1 = require("./gossipValidation");
var AttestationErrorCode;
(function (AttestationErrorCode) {
    /**
     * The target state cannot be fetched
     */
    AttestationErrorCode["TARGET_STATE_MISSING"] = "ATTESTATION_ERROR_TARGET_STATE_MISSING";
    /**
     * The attestation is from a slot that is later than the current slot (with respect to the gossip clock disparity).
     */
    AttestationErrorCode["FUTURE_SLOT"] = "ATTESTATION_ERROR_FUTURE_SLOT";
    /**
     * The attestation is from a slot that is prior to the earliest permissible slot
     * (with respect to the gossip clock disparity).
     */
    AttestationErrorCode["PAST_SLOT"] = "ATTESTATION_ERROR_PAST_SLOT";
    /**
     * The attestations aggregation bits were empty when they shouldn't be.
     */
    AttestationErrorCode["EMPTY_AGGREGATION_BITFIELD"] = "ATTESTATION_ERROR_EMPTY_AGGREGATION_BITFIELD";
    /**
     * The `selection_proof` on the aggregate attestation selects it as a validator,
     * however the aggregator index is not in the committee for that attestation.
     */
    AttestationErrorCode["AGGREGATOR_NOT_IN_COMMITTEE"] = "ATTESTATION_ERROR_AGGREGATOR_NOT_IN_COMMITTEE";
    /**
     * The aggregator index refers to a validator index that we have not seen.
     */
    AttestationErrorCode["AGGREGATOR_PUBKEY_UNKNOWN"] = "ATTESTATION_ERROR_AGGREGATOR_PUBKEY_UNKNOWN";
    /**
     * The attestation has been seen before; either in a block, on the gossip network or from a local validator.
     */
    AttestationErrorCode["ATTESTATION_ALREADY_KNOWN"] = "ATTESTATION_ERROR_ATTESTATION_ALREADY_KNOWN";
    /**
     * There has already been an aggregation observed for this validator, we refuse to process a second.
     */
    AttestationErrorCode["AGGREGATOR_ALREADY_KNOWN"] = "ATTESTATION_ERROR_AGGREGATOR_ALREADY_KNOWN";
    /**
     * The aggregator index is higher than the maximum possible validator count.
     */
    AttestationErrorCode["AGGREGATOR_INDEX_TOO_HIGH"] = "ATTESTATION_ERROR_AGGREGATOR_INDEX_TOO_HIGH";
    /**
     * The `attestation.data.beacon_block_root` block is unknown.
     */
    AttestationErrorCode["UNKNOWN_BEACON_BLOCK_ROOT"] = "ATTESTATION_ERROR_UNKNOWN_BEACON_BLOCK_ROOT";
    /**
     * The `attestation.data.slot` is not from the same epoch as `data.target.epoch`.
     */
    AttestationErrorCode["BAD_TARGET_EPOCH"] = "ATTESTATION_ERROR_BAD_TARGET_EPOCH";
    /**
     * The `attestation.data.beaconBlockRoot` is not a descendant of `data.target.root`.
     */
    AttestationErrorCode["HEAD_NOT_TARGET_DESCENDANT"] = "ATTESTATION_ERROR_HEAD_NOT_TARGET_DESCENDANT";
    /**
     * The target root of the attestation points to a block that we have not verified.
     */
    AttestationErrorCode["UNKNOWN_TARGET_ROOT"] = "ATTESTATION_ERROR_UNKNOWN_TARGET_ROOT";
    /**
     * A signature on the attestation is invalid.
     */
    AttestationErrorCode["INVALID_SIGNATURE"] = "ATTESTATION_ERROR_INVALID_SIGNATURE";
    /**
     * There is no committee for the slot and committee index of this attestation
     * and the attestation should not have been produced.
     */
    AttestationErrorCode["NO_COMMITTEE_FOR_SLOT_AND_INDEX"] = "ATTESTATION_ERROR_NO_COMMITTEE_FOR_SLOT_AND_INDEX";
    /**
     * The unaggregated attestation doesn't have only one aggregation bit set.
     */
    AttestationErrorCode["NOT_EXACTLY_ONE_AGGREGATION_BIT_SET"] = "ATTESTATION_ERROR_NOT_EXACTLY_ONE_AGGREGATION_BIT_SET";
    /**
     * We have already observed an attestation for the `validator_index` and refuse to process another.
     */
    AttestationErrorCode["PRIOR_ATTESTATION_KNOWN"] = "ATTESTATION_ERROR_PRIOR_ATTESTATION_KNOWN";
    /**
     * The attestation is for an epoch in the future (with respect to the gossip clock disparity).
     */
    AttestationErrorCode["FUTURE_EPOCH"] = "ATTESTATION_ERROR_FUTURE_EPOCH";
    /**
     * The attestation is for an epoch in the past (with respect to the gossip clock disparity).
     */
    AttestationErrorCode["PAST_EPOCH"] = "ATTESTATION_ERROR_PAST_EPOCH";
    /**
     * The attestation is attesting to a state that is later than itself. (Viz., attesting to the future).
     */
    AttestationErrorCode["ATTESTS_TO_FUTURE_BLOCK"] = "ATTESTATION_ERROR_ATTESTS_TO_FUTURE_BLOCK";
    /**
     * The attestation was received on an invalid attestation subnet.
     */
    AttestationErrorCode["INVALID_SUBNET_ID"] = "ATTESTATION_ERROR_INVALID_SUBNET_ID";
    /**
     * Number of aggregation bits does not match committee size
     */
    AttestationErrorCode["WRONG_NUMBER_OF_AGGREGATION_BITS"] = "ATTESTATION_ERROR_WRONG_NUMBER_OF_AGGREGATION_BITS";
    /**
     * Block did not pass validation during block processing.
     */
    AttestationErrorCode["KNOWN_BAD_BLOCK"] = "ATTESTATION_ERROR_KNOWN_BAD_BLOCK";
    /**
     * The current finalized checkpoint is not an ancestor of the block defined by attestation.data.beacon_block_root.
     */
    AttestationErrorCode["INVALID_TARGET_ROOT"] = "ATTESTATION_ERROR_INVALID_TARGET_ROOT";
    /**
     * The The attestation target block is not an ancestor of the block named in the LMD vote.
     */
    AttestationErrorCode["TARGET_BLOCK_NOT_AN_ANCESTOR_OF_LMD_BLOCK"] = "ATTESTATION_ERROR_TARGET_BLOCK_NOT_AN_ANCESTOR_OF_LMD_BLOCK";
    /**
     * Committee index out of range.
     */
    AttestationErrorCode["COMMITTEE_INDEX_OUT_OF_RANGE"] = "ATTESTATION_ERROR_COMMITTEE_INDEX_OUT_OF_RANGE";
    /**
     * Missing attestation head state
     */
    AttestationErrorCode["MISSING_ATTESTATION_HEAD_STATE"] = "ATTESTATION_ERROR_MISSING_ATTESTATION_HEAD_STATE";
    /**
     * Invalid aggregator.
     */
    AttestationErrorCode["INVALID_AGGREGATOR"] = "ATTESTATION_ERROR_INVALID_AGGREGATOR";
    /**
     * Invalid attestation indexes: not sorted or unique
     */
    AttestationErrorCode["INVALID_INDEXED_ATTESTATION"] = "ATTESTATION_ERROR_INVALID_INDEXED_ATTESTATION";
})(AttestationErrorCode = exports.AttestationErrorCode || (exports.AttestationErrorCode = {}));
class AttestationError extends gossipValidation_1.GossipActionError {
    getMetadata() {
        const type = this.type;
        switch (type.code) {
            case AttestationErrorCode.UNKNOWN_TARGET_ROOT:
                return { code: type.code, root: (0, ssz_1.toHexString)(type.root) };
            case AttestationErrorCode.MISSING_ATTESTATION_HEAD_STATE:
                // TODO: The stack trace gets lost here
                return { code: type.code, error: type.error.message };
            default:
                return type;
        }
    }
}
exports.AttestationError = AttestationError;
//# sourceMappingURL=attestationError.js.map