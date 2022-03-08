"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurroundAttestationError = exports.SurroundAttestationErrorCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
var SurroundAttestationErrorCode;
(function (SurroundAttestationErrorCode) {
    /**
     * The provided attestation is surrounding at least another attestation from the store
     */
    SurroundAttestationErrorCode["IS_SURROUNDING"] = "ERR_SURROUND_ATTESTATION_IS_SURROUNDING";
    /**
     * The provided attestation is surrounded by at least another attestation from the store
     */
    SurroundAttestationErrorCode["IS_SURROUNDED"] = "ERR_SURROUND_ATTESTATION_IS_SURROUNDED";
})(SurroundAttestationErrorCode = exports.SurroundAttestationErrorCode || (exports.SurroundAttestationErrorCode = {}));
class SurroundAttestationError extends lodestar_utils_1.LodestarError {
    constructor(type) {
        super(type);
    }
}
exports.SurroundAttestationError = SurroundAttestationError;
//# sourceMappingURL=errors.js.map