"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightclientEvent = void 0;
var LightclientEvent;
(function (LightclientEvent) {
    /**
     * New head
     */
    LightclientEvent["head"] = "head";
    /**
     * Stored nextSyncCommittee from an update at period `period`.
     * Note: the SyncCommittee is stored for `period + 1`.
     */
    LightclientEvent["committee"] = "committee";
})(LightclientEvent = exports.LightclientEvent || (exports.LightclientEvent = {}));
//# sourceMappingURL=events.js.map