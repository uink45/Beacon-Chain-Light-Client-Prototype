"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAggregatedPubkey = void 0;
const bls_1 = require("@chainsafe/bls");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
function getAggregatedPubkey(signatureSet) {
    switch (signatureSet.type) {
        case lodestar_beacon_state_transition_1.SignatureSetType.single:
            return signatureSet.pubkey;
        case lodestar_beacon_state_transition_1.SignatureSetType.aggregate:
            return bls_1.bls.PublicKey.aggregate(signatureSet.pubkeys);
        default:
            throw Error("Unknown signature set type");
    }
}
exports.getAggregatedPubkey = getAggregatedPubkey;
//# sourceMappingURL=utils.js.map