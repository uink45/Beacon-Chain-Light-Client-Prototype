"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAggregateAndProofSignatureSet = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
function getAggregateAndProofSignatureSet(state, epoch, aggregator, aggregateAndProof) {
    const slot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(epoch);
    const aggregatorDomain = state.config.getDomain(lodestar_params_1.DOMAIN_AGGREGATE_AND_PROOF, slot);
    const signingRoot = (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.phase0.AggregateAndProof, aggregateAndProof.message, aggregatorDomain);
    return {
        type: lodestar_beacon_state_transition_1.SignatureSetType.single,
        pubkey: aggregator,
        signingRoot,
        signature: aggregateAndProof.signature.valueOf(),
    };
}
exports.getAggregateAndProofSignatureSet = getAggregateAndProofSignatureSet;
//# sourceMappingURL=aggregateAndProof.js.map