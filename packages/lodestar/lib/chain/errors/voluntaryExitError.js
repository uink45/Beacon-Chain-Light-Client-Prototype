"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoluntaryExitError = exports.VoluntaryExitErrorCode = void 0;
const gossipValidation_1 = require("./gossipValidation");
var VoluntaryExitErrorCode;
(function (VoluntaryExitErrorCode) {
    VoluntaryExitErrorCode["ALREADY_EXISTS"] = "VOLUNTARY_EXIT_ERROR_ALREADY_EXISTS";
    VoluntaryExitErrorCode["INVALID"] = "VOLUNTARY_EXIT_ERROR_INVALID";
    VoluntaryExitErrorCode["INVALID_SIGNATURE"] = "VOLUNTARY_EXIT_ERROR_INVALID_SIGNATURE";
})(VoluntaryExitErrorCode = exports.VoluntaryExitErrorCode || (exports.VoluntaryExitErrorCode = {}));
class VoluntaryExitError extends gossipValidation_1.GossipActionError {
}
exports.VoluntaryExitError = VoluntaryExitError;
//# sourceMappingURL=voluntaryExitError.js.map