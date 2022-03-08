"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidAttestationError = exports.InvalidAttestationErrorCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
var InvalidAttestationErrorCode;
(function (InvalidAttestationErrorCode) {
    /**
     * The attestation has the same target epoch as an attestation from the DB
     */
    InvalidAttestationErrorCode["DOUBLE_VOTE"] = "ERR_INVALID_ATTESTATION_DOUBLE_VOTE";
    /**
     * The attestation surrounds an existing attestation from the database `prev`
     */
    InvalidAttestationErrorCode["NEW_SURROUNDS_PREV"] = "ERR_INVALID_ATTESTATION_NEW_SURROUNDS_PREV";
    /**
     * The attestation is surrounded by an existing attestation from the database `prev`
     */
    InvalidAttestationErrorCode["PREV_SURROUNDS_NEW"] = "ERR_INVALID_ATTESTATION_PREV_SURROUNDS_NEW";
    /**
     * The attestation is invalid because its source epoch is greater than its target epoch
     */
    InvalidAttestationErrorCode["SOURCE_EXCEEDS_TARGET"] = "ERR_INVALID_ATTESTATION_SOURCE_EXCEEDS_TARGET";
    /**
     * The attestation is invalid because its source epoch is less than the lower bound on source
     * epochs for this validator.
     */
    InvalidAttestationErrorCode["SOURCE_LESS_THAN_LOWER_BOUND"] = "ERR_INVALID_ATTESTATION_SOURCE_LESS_THAN_LOWER_BOUND";
    /**
     * The attestation is invalid because its target epoch is less than or equal to the lower
     * bound on target epochs for this validator.
     */
    InvalidAttestationErrorCode["TARGET_LESS_THAN_OR_EQ_LOWER_BOUND"] = "ERR_INVALID_ATTESTATION_TARGET_LESS_THAN_OR_EQ_LOWER_BOUND";
})(InvalidAttestationErrorCode = exports.InvalidAttestationErrorCode || (exports.InvalidAttestationErrorCode = {}));
class InvalidAttestationError extends lodestar_utils_1.LodestarError {
    constructor(type) {
        super(type);
    }
}
exports.InvalidAttestationError = InvalidAttestationError;
//# sourceMappingURL=errors.js.map