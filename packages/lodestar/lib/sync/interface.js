"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingBlockStatus = exports.syncStateMetric = exports.SyncState = void 0;
var SyncState;
(function (SyncState) {
    /** No useful peers are connected */
    SyncState["Stalled"] = "Stalled";
    /** The node is performing a long-range sync over a finalized chain */
    SyncState["SyncingFinalized"] = "SyncingFinalized";
    /** The node is performing a long-range sync over head chains */
    SyncState["SyncingHead"] = "SyncingHead";
    /** The node is up to date with all known peers */
    SyncState["Synced"] = "Synced";
})(SyncState = exports.SyncState || (exports.SyncState = {}));
/** Map a SyncState to an integer for rendering in Grafana */
exports.syncStateMetric = {
    [SyncState.Stalled]: 0,
    [SyncState.SyncingFinalized]: 1,
    [SyncState.SyncingHead]: 2,
    [SyncState.Synced]: 3,
};
var PendingBlockStatus;
(function (PendingBlockStatus) {
    PendingBlockStatus["pending"] = "pending";
    PendingBlockStatus["fetching"] = "fetching";
    PendingBlockStatus["processing"] = "processing";
})(PendingBlockStatus = exports.PendingBlockStatus || (exports.PendingBlockStatus = {}));
//# sourceMappingURL=interface.js.map