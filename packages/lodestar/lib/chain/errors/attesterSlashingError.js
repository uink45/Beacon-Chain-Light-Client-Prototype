"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttesterSlashingError = exports.AttesterSlashingErrorCode = void 0;
const gossipValidation_1 = require("./gossipValidation");
var AttesterSlashingErrorCode;
(function (AttesterSlashingErrorCode) {
    AttesterSlashingErrorCode["ALREADY_EXISTS"] = "ATTESTATION_SLASHING_ERROR_ALREADY_EXISTS";
    AttesterSlashingErrorCode["INVALID"] = "ATTESTATION_SLASHING_ERROR_INVALID";
})(AttesterSlashingErrorCode = exports.AttesterSlashingErrorCode || (exports.AttesterSlashingErrorCode = {}));
class AttesterSlashingError extends gossipValidation_1.GossipActionError {
}
exports.AttesterSlashingError = AttesterSlashingError;
//# sourceMappingURL=attesterSlashingError.js.map