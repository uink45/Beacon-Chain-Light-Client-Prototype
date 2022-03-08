"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutePayloadStatus = void 0;
var ExecutePayloadStatus;
(function (ExecutePayloadStatus) {
    /** given payload is valid */
    ExecutePayloadStatus["VALID"] = "VALID";
    /** given payload is invalid */
    ExecutePayloadStatus["INVALID"] = "INVALID";
    /** sync process is in progress */
    ExecutePayloadStatus["SYNCING"] = "SYNCING";
    /**
     * blockHash is valid, but payload is not part of canonical chain and hasn't been fully
     * validated
     */
    ExecutePayloadStatus["ACCEPTED"] = "ACCEPTED";
    /** blockHash is invalid */
    ExecutePayloadStatus["INVALID_BLOCK_HASH"] = "INVALID_BLOCK_HASH";
    /** invalid terminal block */
    ExecutePayloadStatus["INVALID_TERMINAL_BLOCK"] = "INVALID_TERMINAL_BLOCK";
    /** EL error */
    ExecutePayloadStatus["ELERROR"] = "ELERROR";
    /** EL unavailable */
    ExecutePayloadStatus["UNAVAILABLE"] = "UNAVAILABLE";
    /** EL replied with SYNCING or ACCEPTED when its not safe to import optimistic blocks */
    ExecutePayloadStatus["UNSAFE_OPTIMISTIC_STATUS"] = "UNSAFE_OPTIMISTIC_STATUS";
})(ExecutePayloadStatus = exports.ExecutePayloadStatus || (exports.ExecutePayloadStatus = {}));
//# sourceMappingURL=interface.js.map