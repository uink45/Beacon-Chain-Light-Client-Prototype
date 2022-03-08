"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGossipAttesterSlashing = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const peers_1 = require("../../network/peers");
const errors_1 = require("../errors");
async function validateGossipAttesterSlashing(chain, attesterSlashing) {
    // [IGNORE] At least one index in the intersection of the attesting indices of each attestation has not yet been seen
    // in any prior attester_slashing (i.e.
    //   attester_slashed_indices = set(attestation_1.attesting_indices).intersection(attestation_2.attesting_indices
    // ), verify if any(attester_slashed_indices.difference(prior_seen_attester_slashed_indices))).
    const intersectingIndices = (0, lodestar_beacon_state_transition_1.getAttesterSlashableIndices)(attesterSlashing);
    if (chain.opPool.hasSeenAttesterSlashing(intersectingIndices)) {
        throw new errors_1.AttesterSlashingError(errors_1.GossipAction.IGNORE, null, {
            code: errors_1.AttesterSlashingErrorCode.ALREADY_EXISTS,
        });
    }
    const state = chain.getHeadState();
    // [REJECT] All of the conditions within process_attester_slashing pass validation.
    try {
        // verifySignature = false, verified in batch below
        lodestar_beacon_state_transition_1.allForks.assertValidAttesterSlashing(state, attesterSlashing, false);
    }
    catch (e) {
        throw new errors_1.AttesterSlashingError(errors_1.GossipAction.REJECT, peers_1.PeerAction.HighToleranceError, {
            code: errors_1.AttesterSlashingErrorCode.INVALID,
            error: e,
        });
    }
    const signatureSets = lodestar_beacon_state_transition_1.allForks.getAttesterSlashingSignatureSets(state, attesterSlashing);
    if (!(await chain.bls.verifySignatureSets(signatureSets, { batchable: true }))) {
        throw new errors_1.AttesterSlashingError(errors_1.GossipAction.REJECT, peers_1.PeerAction.HighToleranceError, {
            code: errors_1.AttesterSlashingErrorCode.INVALID,
            error: Error("Invalid signature"),
        });
    }
}
exports.validateGossipAttesterSlashing = validateGossipAttesterSlashing;
//# sourceMappingURL=attesterSlashing.js.map