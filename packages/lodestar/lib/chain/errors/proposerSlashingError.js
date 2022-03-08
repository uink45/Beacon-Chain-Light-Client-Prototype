"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposerSlashingError = exports.ProposerSlashingErrorCode = void 0;
const gossipValidation_1 = require("./gossipValidation");
var ProposerSlashingErrorCode;
(function (ProposerSlashingErrorCode) {
    ProposerSlashingErrorCode["ALREADY_EXISTS"] = "PROPOSER_SLASHING_ERROR_ALREADY_EXISTS";
    ProposerSlashingErrorCode["INVALID"] = "PROPOSER_SLASHING_ERROR_INVALID";
})(ProposerSlashingErrorCode = exports.ProposerSlashingErrorCode || (exports.ProposerSlashingErrorCode = {}));
class ProposerSlashingError extends gossipValidation_1.GossipActionError {
}
exports.ProposerSlashingError = ProposerSlashingError;
//# sourceMappingURL=proposerSlashingError.js.map