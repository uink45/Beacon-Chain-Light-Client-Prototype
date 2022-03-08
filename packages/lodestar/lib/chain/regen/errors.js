"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegenError = exports.RegenErrorCode = void 0;
var RegenErrorCode;
(function (RegenErrorCode) {
    RegenErrorCode["BLOCK_NOT_IN_FORKCHOICE"] = "REGEN_ERROR_BLOCK_NOT_IN_FORKCHOICE";
    RegenErrorCode["STATE_NOT_IN_FORKCHOICE"] = "REGEN_ERROR_STATE_NOT_IN_FORKCHOICE";
    RegenErrorCode["SLOT_BEFORE_BLOCK_SLOT"] = "REGEN_ERROR_SLOT_BEFORE_BLOCK_SLOT";
    RegenErrorCode["NO_SEED_STATE"] = "REGEN_ERROR_NO_SEED_STATE";
    RegenErrorCode["TOO_MANY_BLOCK_PROCESSED"] = "REGEN_ERROR_TOO_MANY_BLOCK_PROCESSED";
    RegenErrorCode["BLOCK_NOT_IN_DB"] = "REGEN_ERROR_BLOCK_NOT_IN_DB";
    RegenErrorCode["STATE_TRANSITION_ERROR"] = "REGEN_ERROR_STATE_TRANSITION_ERROR";
})(RegenErrorCode = exports.RegenErrorCode || (exports.RegenErrorCode = {}));
class RegenError extends Error {
    constructor(type) {
        super(type.code);
        this.type = type;
    }
}
exports.RegenError = RegenError;
//# sourceMappingURL=errors.js.map