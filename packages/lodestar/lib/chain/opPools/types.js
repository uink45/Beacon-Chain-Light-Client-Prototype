"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpPoolError = exports.OpPoolErrorCode = exports.InsertOutcome = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
/**
 * Result of adding data to an operation pool of an aggregatable object.
 */
var InsertOutcome;
(function (InsertOutcome) {
    /** The data had not been seen before and was added to the pool. */
    InsertOutcome["NewData"] = "NewData";
    /** A validator signature for a participant of this data is already known. No changes were made. */
    InsertOutcome["AlreadyKnown"] = "AlreadyKnown";
    /** Not existing in the pool but it's too old to add. No changes were made. */
    InsertOutcome["Old"] = "Old";
    /** The data is know, and the new participants have been added to the aggregated signature */
    InsertOutcome["Aggregated"] = "Aggregated";
    /** The data is not better than the existing data*/
    InsertOutcome["NotBetterThan"] = "NotBetterThan";
})(InsertOutcome = exports.InsertOutcome || (exports.InsertOutcome = {}));
var OpPoolErrorCode;
(function (OpPoolErrorCode) {
    /** The given object slot was too low to be stored. No changes were made. */
    OpPoolErrorCode["SLOT_TOO_LOW"] = "OP_POOL_ERROR_SLOT_TOO_LOW";
    /** Reached max number of unique objects per slot. This is a DoS protection function. */
    OpPoolErrorCode["REACHED_MAX_PER_SLOT"] = "OP_POOL_ERROR_REACHED_MAX_PER_SLOT";
})(OpPoolErrorCode = exports.OpPoolErrorCode || (exports.OpPoolErrorCode = {}));
class OpPoolError extends lodestar_utils_1.LodestarError {
}
exports.OpPoolError = OpPoolError;
//# sourceMappingURL=types.js.map