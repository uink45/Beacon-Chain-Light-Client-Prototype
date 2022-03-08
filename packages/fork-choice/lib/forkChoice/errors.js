"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForkChoiceError = exports.ForkChoiceErrorCode = exports.InvalidAttestationCode = exports.InvalidBlockCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
var InvalidBlockCode;
(function (InvalidBlockCode) {
    InvalidBlockCode["UNKNOWN_PARENT"] = "UNKNOWN_PARENT";
    InvalidBlockCode["FUTURE_SLOT"] = "FUTURE_SLOT";
    InvalidBlockCode["FINALIZED_SLOT"] = "FINALIZED_SLOT";
    InvalidBlockCode["NOT_FINALIZED_DESCENDANT"] = "NOT_FINALIZED_DESCENDANT";
})(InvalidBlockCode = exports.InvalidBlockCode || (exports.InvalidBlockCode = {}));
var InvalidAttestationCode;
(function (InvalidAttestationCode) {
    /**
     * The attestations aggregation bits were empty when they shouldn't be.
     */
    InvalidAttestationCode["EMPTY_AGGREGATION_BITFIELD"] = "EMPTY_AGGREGATION_BITFIELD";
    /**
     * The `attestation.data.beacon_block_root` block is unknown.
     */
    InvalidAttestationCode["UNKNOWN_HEAD_BLOCK"] = "UNKNOWN_HEAD_BLOCK";
    /**
     * The `attestation.data.slot` is not from the same epoch as `data.target.epoch` and therefore
     * the attestation is invalid.
     */
    InvalidAttestationCode["BAD_TARGET_EPOCH"] = "BAD_TARGET_EPOCH";
    /**
     * The target root of the attestation points to a block that we have not verified.
     */
    InvalidAttestationCode["UNKNOWN_TARGET_ROOT"] = "UNKNOWN_TARGET_ROOT";
    /**
     * The attestation is for an epoch in the future (with respect to the gossip clock disparity).
     */
    InvalidAttestationCode["FUTURE_EPOCH"] = "FUTURE_EPOCH";
    /**
     * The attestation is for an epoch in the past (with respect to the gossip clock disparity).
     */
    InvalidAttestationCode["PAST_EPOCH"] = "PAST_EPOCH";
    /**
     * The attestation references a target root that does not match what is stored in our database.
     */
    InvalidAttestationCode["INVALID_TARGET"] = "INVALID_TARGET";
    /**
     * The attestation is attesting to a state that is later than itself. (Viz., attesting to the future).
     */
    InvalidAttestationCode["ATTESTS_TO_FUTURE_BLOCK"] = "ATTESTS_TO_FUTURE_BLOCK";
    /**
     * Attestations can only affect the fork choice of subsequent slots.
     * Delay consideration in the fork choice until their slot is in the past.
     */
    InvalidAttestationCode["FUTURE_SLOT"] = "FUTURE_SLOT";
})(InvalidAttestationCode = exports.InvalidAttestationCode || (exports.InvalidAttestationCode = {}));
var ForkChoiceErrorCode;
(function (ForkChoiceErrorCode) {
    ForkChoiceErrorCode["INVALID_ATTESTATION"] = "FORKCHOICE_ERROR_INVALID_ATTESTATION";
    ForkChoiceErrorCode["INVALID_BLOCK"] = "FORKCHOICE_ERROR_INVALID_BLOCK";
    ForkChoiceErrorCode["PROTO_ARRAY_ERROR"] = "FORKCHOICE_ERROR_PROTO_ARRAY_ERROR";
    ForkChoiceErrorCode["INVALID_PROTO_ARRAY_BYTES"] = "FORKCHOICE_ERROR_INVALID_PROTO_ARRAY_BYTES";
    ForkChoiceErrorCode["MISSING_PROTO_ARRAY_BLOCK"] = "FORKCHOICE_ERROR_MISSING_PROTO_ARRAY_BLOCK";
    ForkChoiceErrorCode["UNKNOWN_ANCESTOR"] = "FORKCHOICE_ERROR_UNKNOWN_ANCESTOR";
    ForkChoiceErrorCode["INCONSISTENT_ON_TICK"] = "FORKCHOICE_ERROR_INCONSISTENT_ON_TICK";
    ForkChoiceErrorCode["BEACON_STATE_ERROR"] = "FORKCHOICE_ERROR_BEACON_STATE_ERROR";
    ForkChoiceErrorCode["ATTEMPT_TO_REVERT_JUSTIFICATION"] = "FORKCHOICE_ERROR_ATTEMPT_TO_REVERT_JUSTIFICATION";
    ForkChoiceErrorCode["FORK_CHOICE_STORE_ERROR"] = "FORKCHOICE_ERROR_FORK_CHOICE_STORE_ERROR";
    ForkChoiceErrorCode["UNABLE_TO_SET_JUSTIFIED_CHECKPOINT"] = "FORKCHOICE_ERROR_UNABLE_TO_SET_JUSTIFIED_CHECKPOINT";
    ForkChoiceErrorCode["AFTER_BLOCK_FAILED"] = "FORKCHOICE_ERROR_AFTER_BLOCK_FAILED";
})(ForkChoiceErrorCode = exports.ForkChoiceErrorCode || (exports.ForkChoiceErrorCode = {}));
class ForkChoiceError extends lodestar_utils_1.LodestarError {
    constructor(type) {
        super(type);
    }
}
exports.ForkChoiceError = ForkChoiceError;
//# sourceMappingURL=errors.js.map