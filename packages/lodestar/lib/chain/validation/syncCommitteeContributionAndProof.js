"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSyncCommitteeGossipContributionAndProof = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const errors_1 = require("../errors");
const syncCommittee_1 = require("./syncCommittee");
const signatureSets_1 = require("./signatureSets");
const peers_1 = require("../../network/peers");
/**
 * Spec v1.1.0-beta.2
 */
async function validateSyncCommitteeGossipContributionAndProof(chain, signedContributionAndProof) {
    const contributionAndProof = signedContributionAndProof.message;
    const { contribution, aggregatorIndex } = contributionAndProof;
    const { subcommitteeIndex, slot } = contribution;
    const headState = chain.getHeadState();
    (0, syncCommittee_1.validateGossipSyncCommitteeExceptSig)(chain, headState, subcommitteeIndex, {
        slot,
        validatorIndex: contributionAndProof.aggregatorIndex,
    });
    // [IGNORE] The contribution's slot is for the current slot, i.e. contribution.slot == current_slot.
    // > Checked in validateGossipSyncCommitteeExceptSig()
    // [REJECT] The aggregator's validator index is in the declared subcommittee of the current sync committee
    // -- i.e. state.validators[contribution_and_proof.aggregator_index].pubkey in
    // get_sync_subcommittee_pubkeys(state, contribution.subcommittee_index).
    // > Checked in validateGossipSyncCommitteeExceptSig()
    // [IGNORE] The sync committee contribution is the first valid contribution received for the aggregator with index
    // contribution_and_proof.aggregator_index for the slot contribution.slot and subcommittee index contribution.subcommittee_index.
    if (chain.seenContributionAndProof.isKnown(slot, subcommitteeIndex, aggregatorIndex)) {
        throw new errors_1.SyncCommitteeError(errors_1.GossipAction.IGNORE, null, {
            code: errors_1.SyncCommitteeErrorCode.SYNC_COMMITTEE_ALREADY_KNOWN,
        });
    }
    // [REJECT] The contribution has participants -- that is, any(contribution.aggregation_bits)
    const pubkeys = (0, signatureSets_1.getContributionPubkeys)(headState, contribution);
    if (!pubkeys.length) {
        throw new errors_1.SyncCommitteeError(errors_1.GossipAction.REJECT, peers_1.PeerAction.LowToleranceError, {
            code: errors_1.SyncCommitteeErrorCode.NO_PARTICIPANT,
        });
    }
    // [REJECT] contribution_and_proof.selection_proof selects the validator as an aggregator for the slot --
    // i.e. is_sync_committee_aggregator(contribution_and_proof.selection_proof) returns True.
    if (!(0, lodestar_beacon_state_transition_1.isSyncCommitteeAggregator)(contributionAndProof.selectionProof)) {
        throw new errors_1.SyncCommitteeError(errors_1.GossipAction.REJECT, peers_1.PeerAction.LowToleranceError, {
            code: errors_1.SyncCommitteeErrorCode.INVALID_AGGREGATOR,
            aggregatorIndex: contributionAndProof.aggregatorIndex,
        });
    }
    // [REJECT] The aggregator's validator index is in the declared subcommittee of the current sync committee --
    // i.e. state.validators[contribution_and_proof.aggregator_index].pubkey in get_sync_subcommittee_pubkeys(state, contribution.subcommittee_index).
    // > Checked in validateGossipSyncCommitteeExceptSig()
    const signatureSets = [
        // [REJECT] The contribution_and_proof.selection_proof is a valid signature of the SyncAggregatorSelectionData
        // derived from the contribution by the validator with index contribution_and_proof.aggregator_index.
        (0, signatureSets_1.getSyncCommitteeSelectionProofSignatureSet)(headState, contributionAndProof),
        // [REJECT] The aggregator signature, signed_contribution_and_proof.signature, is valid.
        (0, signatureSets_1.getContributionAndProofSignatureSet)(headState, signedContributionAndProof),
        // [REJECT] The aggregate signature is valid for the message beacon_block_root and aggregate pubkey derived from
        // the participation info in aggregation_bits for the subcommittee specified by the contribution.subcommittee_index.
        (0, signatureSets_1.getSyncCommitteeContributionSignatureSet)(headState, contribution, pubkeys),
    ];
    if (!(await chain.bls.verifySignatureSets(signatureSets, { batchable: true }))) {
        throw new errors_1.SyncCommitteeError(errors_1.GossipAction.REJECT, peers_1.PeerAction.LowToleranceError, {
            code: errors_1.SyncCommitteeErrorCode.INVALID_SIGNATURE,
        });
    }
    // no need to add to seenSyncCommittteeContributionCache here, gossip handler will do that
    chain.seenContributionAndProof.add(slot, subcommitteeIndex, aggregatorIndex);
    return { syncCommitteeParticipants: pubkeys.length };
}
exports.validateSyncCommitteeGossipContributionAndProof = validateSyncCommitteeGossipContributionAndProof;
//# sourceMappingURL=syncCommitteeContributionAndProof.js.map