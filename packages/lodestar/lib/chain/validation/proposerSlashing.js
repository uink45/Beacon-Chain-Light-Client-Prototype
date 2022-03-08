"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGossipProposerSlashing = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const peers_1 = require("../../network/peers");
const errors_1 = require("../errors");
async function validateGossipProposerSlashing(chain, proposerSlashing) {
    // [IGNORE] The proposer slashing is the first valid proposer slashing received for the proposer with index
    // proposer_slashing.signed_header_1.message.proposer_index.
    if (chain.opPool.hasSeenProposerSlashing(proposerSlashing.signedHeader1.message.proposerIndex)) {
        throw new errors_1.ProposerSlashingError(errors_1.GossipAction.IGNORE, null, {
            code: errors_1.ProposerSlashingErrorCode.ALREADY_EXISTS,
        });
    }
    const state = chain.getHeadState();
    // [REJECT] All of the conditions within process_proposer_slashing pass validation.
    try {
        // verifySignature = false, verified in batch below
        lodestar_beacon_state_transition_1.allForks.assertValidProposerSlashing(state, proposerSlashing, false);
    }
    catch (e) {
        throw new errors_1.ProposerSlashingError(errors_1.GossipAction.REJECT, peers_1.PeerAction.HighToleranceError, {
            code: errors_1.ProposerSlashingErrorCode.INVALID,
            error: e,
        });
    }
    const signatureSets = lodestar_beacon_state_transition_1.allForks.getProposerSlashingSignatureSets(state, proposerSlashing);
    if (!(await chain.bls.verifySignatureSets(signatureSets, { batchable: true }))) {
        throw new errors_1.ProposerSlashingError(errors_1.GossipAction.REJECT, peers_1.PeerAction.HighToleranceError, {
            code: errors_1.ProposerSlashingErrorCode.INVALID,
            error: Error("Invalid signature"),
        });
    }
}
exports.validateGossipProposerSlashing = validateGossipProposerSlashing;
//# sourceMappingURL=proposerSlashing.js.map