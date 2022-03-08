"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelectionProofSignatureSet = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
function getSelectionProofSignatureSet(state, slot, aggregator, aggregateAndProof) {
    const selectionProofDomain = state.config.getDomain(lodestar_params_1.DOMAIN_SELECTION_PROOF, slot);
    return {
        type: lodestar_beacon_state_transition_1.SignatureSetType.single,
        pubkey: aggregator,
        signingRoot: (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.Slot, slot, selectionProofDomain),
        signature: aggregateAndProof.message.selectionProof.valueOf(),
    };
}
exports.getSelectionProofSignatureSet = getSelectionProofSignatureSet;
//# sourceMappingURL=selectionProof.js.map