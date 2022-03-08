"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eth1Error = exports.Eth1ErrorCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
var Eth1ErrorCode;
(function (Eth1ErrorCode) {
    /** Deposit index too high */
    Eth1ErrorCode["DEPOSIT_INDEX_TOO_HIGH"] = "ETH1_ERROR_DEPOSIT_INDEX_TOO_HIGH";
    /** Not enough deposits in DB */
    Eth1ErrorCode["NOT_ENOUGH_DEPOSITS"] = "ETH1_ERROR_NOT_ENOUGH_DEPOSITS";
    /** Too many deposits returned by DB */
    Eth1ErrorCode["TOO_MANY_DEPOSITS"] = "ETH1_ERROR_TOO_MANY_DEPOSITS";
    /** Deposit root tree does not match current eth1Data */
    Eth1ErrorCode["WRONG_DEPOSIT_ROOT"] = "ETH1_ERROR_WRONG_DEPOSIT_ROOT";
    /** No deposits found for block range */
    Eth1ErrorCode["NO_DEPOSITS_FOR_BLOCK_RANGE"] = "ETH1_ERROR_NO_DEPOSITS_FOR_BLOCK_RANGE";
    /** No depositRoot for depositCount */
    Eth1ErrorCode["NO_DEPOSIT_ROOT"] = "ETH1_ERROR_NO_DEPOSIT_ROOT";
    /** Not enough deposit roots for index */
    Eth1ErrorCode["NOT_ENOUGH_DEPOSIT_ROOTS"] = "ETH1_ERROR_NOT_ENOUGH_DEPOSIT_ROOTS";
    /** Attempted to insert a duplicate log for same index into the Eth1DepositsCache */
    Eth1ErrorCode["DUPLICATE_DISTINCT_LOG"] = "ETH1_ERROR_DUPLICATE_DISTINCT_LOG";
    /** Attempted to insert a log with index != prev + 1 into the Eth1DepositsCache */
    Eth1ErrorCode["NON_CONSECUTIVE_LOGS"] = "ETH1_ERROR_NON_CONSECUTIVE_LOGS";
    /** Expected a deposit log in the db for the index, missing log implies a corrupted db */
    Eth1ErrorCode["MISSING_DEPOSIT_LOG"] = "ETH1_ERROR_MISSING_DEPOSIT_LOG";
})(Eth1ErrorCode = exports.Eth1ErrorCode || (exports.Eth1ErrorCode = {}));
class Eth1Error extends lodestar_utils_1.LodestarError {
}
exports.Eth1Error = Eth1Error;
//# sourceMappingURL=errors.js.map