"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyncCommitteeSelectionProofSignatureSet = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
function getSyncCommitteeSelectionProofSignatureSet(state, contributionAndProof) {
    const { epochCtx, config } = state;
    const slot = contributionAndProof.contribution.slot;
    const domain = config.getDomain(lodestar_params_1.DOMAIN_SYNC_COMMITTEE_SELECTION_PROOF, slot);
    const signingData = {
        slot,
        subcommitteeIndex: contributionAndProof.contribution.subcommitteeIndex,
    };
    return {
        type: lodestar_beacon_state_transition_1.SignatureSetType.single,
        pubkey: epochCtx.index2pubkey[contributionAndProof.aggregatorIndex],
        signingRoot: (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.altair.SyncAggregatorSelectionData, signingData, domain),
        signature: contributionAndProof.selectionProof.valueOf(),
    };
}
exports.getSyncCommitteeSelectionProofSignatureSet = getSyncCommitteeSelectionProofSignatureSet;
//# sourceMappingURL=syncCommitteeSelectionProof.js.map