"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncCommitteeError = exports.SyncCommitteeErrorCode = void 0;
const gossipValidation_1 = require("./gossipValidation");
var SyncCommitteeErrorCode;
(function (SyncCommitteeErrorCode) {
    SyncCommitteeErrorCode["NOT_CURRENT_SLOT"] = "SYNC_COMMITTEE_ERROR_NOT_CURRENT_SLOT";
    SyncCommitteeErrorCode["UNKNOWN_BEACON_BLOCK_ROOT"] = "SYNC_COMMITTEE_ERROR_UNKNOWN_BEACON_BLOCK_ROOT";
    SyncCommitteeErrorCode["SYNC_COMMITTEE_ALREADY_KNOWN"] = "SYNC_COMMITTEE_ERROR_SYNC_COMMITTEE_ALREADY_KNOWN";
    SyncCommitteeErrorCode["VALIDATOR_NOT_IN_SYNC_COMMITTEE"] = "SYNC_COMMITTEE_ERROR_VALIDATOR_NOT_IN_SYNC_COMMITTEE";
    SyncCommitteeErrorCode["INVALID_SIGNATURE"] = "SYNC_COMMITTEE_INVALID_SIGNATURE";
    SyncCommitteeErrorCode["INVALID_SUBCOMMITTEE_INDEX"] = "SYNC_COMMITTEE_INVALID_SUBCOMMITTEE_INDEX";
    SyncCommitteeErrorCode["NO_PARTICIPANT"] = "SYNC_COMMITTEE_NO_PARTICIPANT";
    SyncCommitteeErrorCode["INVALID_AGGREGATOR"] = "SYNC_COMMITTEE_ERROR_INVALID_AGGREGATOR";
    SyncCommitteeErrorCode["AGGREGATOR_PUBKEY_UNKNOWN"] = "SYNC_COMMITTEE_ERROR_AGGREGATOR_PUBKEY_UNKNOWN";
})(SyncCommitteeErrorCode = exports.SyncCommitteeErrorCode || (exports.SyncCommitteeErrorCode = {}));
class SyncCommitteeError extends gossipValidation_1.GossipActionError {
}
exports.SyncCommitteeError = SyncCommitteeError;
//# sourceMappingURL=syncCommitteeError.js.map