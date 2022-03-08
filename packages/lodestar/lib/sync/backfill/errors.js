"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackfillSyncError = exports.BackfillSyncErrorCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
var BackfillSyncErrorCode;
(function (BackfillSyncErrorCode) {
    /** fetched block doesn't connect to anchor block */
    BackfillSyncErrorCode["NOT_ANCHORED"] = "not_anchored";
    /** fetched blocks are not linear */
    BackfillSyncErrorCode["NOT_LINEAR"] = "not_linear";
    /** peer doesn't have required block by root */
    BackfillSyncErrorCode["MISSING_BLOCK"] = "missing_blocks";
    BackfillSyncErrorCode["INVALID_SIGNATURE"] = "invalid_proposer_signature";
    BackfillSyncErrorCode["INTERNAL_ERROR"] = "backfill_internal_error";
})(BackfillSyncErrorCode = exports.BackfillSyncErrorCode || (exports.BackfillSyncErrorCode = {}));
class BackfillSyncError extends lodestar_utils_1.LodestarError {
}
exports.BackfillSyncError = BackfillSyncError;
//# sourceMappingURL=errors.js.map