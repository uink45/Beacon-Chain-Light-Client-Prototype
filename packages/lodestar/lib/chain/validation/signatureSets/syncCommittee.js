"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyncCommitteeSignatureSet = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
function getSyncCommitteeSignatureSet(state, syncCommittee) {
    const domain = state.config.getDomain(lodestar_params_1.DOMAIN_SYNC_COMMITTEE, syncCommittee.slot);
    return {
        type: lodestar_beacon_state_transition_1.SignatureSetType.single,
        pubkey: state.epochCtx.index2pubkey[syncCommittee.validatorIndex],
        signingRoot: (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.Root, syncCommittee.beaconBlockRoot, domain),
        signature: syncCommittee.signature.valueOf(),
    };
}
exports.getSyncCommitteeSignatureSet = getSyncCommitteeSignatureSet;
//# sourceMappingURL=syncCommittee.js.map