"use strict";
/**
 * @module network/gossip
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GossipEncoding = exports.GossipType = void 0;
const events_1 = require("../events");
var GossipType;
(function (GossipType) {
    // phase0
    GossipType["beacon_block"] = "beacon_block";
    GossipType["beacon_aggregate_and_proof"] = "beacon_aggregate_and_proof";
    GossipType["beacon_attestation"] = "beacon_attestation";
    GossipType["voluntary_exit"] = "voluntary_exit";
    GossipType["proposer_slashing"] = "proposer_slashing";
    GossipType["attester_slashing"] = "attester_slashing";
    // altair
    GossipType["sync_committee_contribution_and_proof"] = "sync_committee_contribution_and_proof";
    GossipType["sync_committee"] = "sync_committee";
})(GossipType = exports.GossipType || (exports.GossipType = {}));
var GossipEncoding;
(function (GossipEncoding) {
    GossipEncoding["ssz_snappy"] = "ssz_snappy";
})(GossipEncoding = exports.GossipEncoding || (exports.GossipEncoding = {}));
//# sourceMappingURL=interface.js.map