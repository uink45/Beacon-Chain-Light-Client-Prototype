"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContributionAndProofSignatureSet = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
function getContributionAndProofSignatureSet(state, signedContributionAndProof) {
    const { epochCtx } = state;
    const domain = state.config.getDomain(lodestar_params_1.DOMAIN_CONTRIBUTION_AND_PROOF, signedContributionAndProof.message.contribution.slot);
    const signingData = signedContributionAndProof.message;
    return {
        type: lodestar_beacon_state_transition_1.SignatureSetType.single,
        pubkey: epochCtx.index2pubkey[signedContributionAndProof.message.aggregatorIndex],
        signingRoot: (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.altair.ContributionAndProof, signingData, domain),
        signature: signedContributionAndProof.signature.valueOf(),
    };
}
exports.getContributionAndProofSignatureSet = getContributionAndProofSignatureSet;
//# sourceMappingURL=contributionAndProof.js.map