"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGossipAggregateAndProof = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const signatureSets_1 = require("./signatureSets");
const errors_1 = require("../errors");
const attestation_1 = require("./attestation");
const regen_1 = require("../regen");
const peers_1 = require("../../network/peers");
async function validateGossipAggregateAndProof(chain, signedAggregateAndProof) {
    // Do checks in this order:
    // - do early checks (w/o indexed attestation)
    // - > obtain indexed attestation and committes per slot
    // - do middle checks w/ indexed attestation
    // - > verify signature
    // - do late checks w/ a valid signature
    const aggregateAndProof = signedAggregateAndProof.message;
    const aggregate = aggregateAndProof.aggregate;
    const attData = aggregate.data;
    const attSlot = attData.slot;
    const attEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(attSlot);
    const attTarget = attData.target;
    const targetEpoch = attTarget.epoch;
    // [REJECT] The attestation's epoch matches its target -- i.e. attestation.data.target.epoch == compute_epoch_at_slot(attestation.data.slot)
    if (targetEpoch !== attEpoch) {
        throw new errors_1.AttestationError(errors_1.GossipAction.REJECT, peers_1.PeerAction.LowToleranceError, {
            code: errors_1.AttestationErrorCode.BAD_TARGET_EPOCH,
        });
    }
    // [IGNORE] aggregate.data.slot is within the last ATTESTATION_PROPAGATION_SLOT_RANGE slots (with a MAXIMUM_GOSSIP_CLOCK_DISPARITY allowance)
    // -- i.e. aggregate.data.slot + ATTESTATION_PROPAGATION_SLOT_RANGE >= current_slot >= aggregate.data.slot
    // (a client MAY queue future aggregates for processing at the appropriate slot).
    (0, attestation_1.verifyPropagationSlotRange)(chain, attSlot);
    // [IGNORE] The aggregate is the first valid aggregate received for the aggregator with
    // index aggregate_and_proof.aggregator_index for the epoch aggregate.data.target.epoch.
    const aggregatorIndex = aggregateAndProof.aggregatorIndex;
    if (chain.seenAggregators.isKnown(targetEpoch, aggregatorIndex)) {
        throw new errors_1.AttestationError(errors_1.GossipAction.IGNORE, null, {
            code: errors_1.AttestationErrorCode.AGGREGATOR_ALREADY_KNOWN,
            targetEpoch,
            aggregatorIndex,
        });
    }
    // [IGNORE] The block being voted for (attestation.data.beacon_block_root) has been seen (via both gossip
    // and non-gossip sources) (a client MAY queue attestations for processing once block is retrieved).
    const attHeadBlock = (0, attestation_1.verifyHeadBlockAndTargetRoot)(chain, attData.beaconBlockRoot, attTarget.root, attEpoch);
    // [REJECT] The current finalized_checkpoint is an ancestor of the block defined by aggregate.data.beacon_block_root
    // -- i.e. get_ancestor(store, aggregate.data.beacon_block_root, compute_start_slot_at_epoch(store.finalized_checkpoint.epoch)) == store.finalized_checkpoint.root
    // > Altready check in `chain.forkChoice.hasBlock(attestation.data.beaconBlockRoot)`
    const attHeadState = await chain.regen
        .getState(attHeadBlock.stateRoot, regen_1.RegenCaller.validateGossipAggregateAndProof)
        .catch((e) => {
        throw new errors_1.AttestationError(errors_1.GossipAction.REJECT, null, {
            code: errors_1.AttestationErrorCode.MISSING_ATTESTATION_HEAD_STATE,
            error: e,
        });
    });
    const committeeIndices = (0, attestation_1.getCommitteeIndices)(attHeadState, attSlot, attData.index);
    const attestingIndices = (0, lodestar_beacon_state_transition_1.zipIndexesCommitteeBits)(committeeIndices, aggregate.aggregationBits);
    const indexedAttestation = {
        attestingIndices: attestingIndices,
        data: attData,
        signature: aggregate.signature,
    };
    // TODO: Check this before regen
    // [REJECT] The attestation has participants -- that is,
    // len(get_attesting_indices(state, aggregate.data, aggregate.aggregation_bits)) >= 1.
    if (attestingIndices.length < 1) {
        // missing attestation participants
        throw new errors_1.AttestationError(errors_1.GossipAction.REJECT, peers_1.PeerAction.LowToleranceError, {
            code: errors_1.AttestationErrorCode.EMPTY_AGGREGATION_BITFIELD,
        });
    }
    // [REJECT] aggregate_and_proof.selection_proof selects the validator as an aggregator for the slot
    // -- i.e. is_aggregator(state, aggregate.data.slot, aggregate.data.index, aggregate_and_proof.selection_proof) returns True.
    if (!(0, lodestar_beacon_state_transition_1.isAggregatorFromCommitteeLength)(committeeIndices.length, aggregateAndProof.selectionProof)) {
        throw new errors_1.AttestationError(errors_1.GossipAction.REJECT, peers_1.PeerAction.LowToleranceError, {
            code: errors_1.AttestationErrorCode.INVALID_AGGREGATOR,
        });
    }
    // [REJECT] The aggregator's validator index is within the committee
    // -- i.e. aggregate_and_proof.aggregator_index in get_beacon_committee(state, aggregate.data.slot, aggregate.data.index).
    if (!committeeIndices.includes(aggregateAndProof.aggregatorIndex)) {
        throw new errors_1.AttestationError(errors_1.GossipAction.REJECT, peers_1.PeerAction.LowToleranceError, {
            code: errors_1.AttestationErrorCode.AGGREGATOR_NOT_IN_COMMITTEE,
        });
    }
    // [REJECT] The aggregate_and_proof.selection_proof is a valid signature of the aggregate.data.slot
    // by the validator with index aggregate_and_proof.aggregator_index.
    // [REJECT] The aggregator signature, signed_aggregate_and_proof.signature, is valid.
    // [REJECT] The signature of aggregate is valid.
    const aggregator = attHeadState.index2pubkey[aggregateAndProof.aggregatorIndex];
    const signatureSets = [
        (0, signatureSets_1.getSelectionProofSignatureSet)(attHeadState, attSlot, aggregator, signedAggregateAndProof),
        (0, signatureSets_1.getAggregateAndProofSignatureSet)(attHeadState, attEpoch, aggregator, signedAggregateAndProof),
        lodestar_beacon_state_transition_1.allForks.getIndexedAttestationSignatureSet(attHeadState, indexedAttestation),
    ];
    if (!(await chain.bls.verifySignatureSets(signatureSets, { batchable: true }))) {
        throw new errors_1.AttestationError(errors_1.GossipAction.REJECT, peers_1.PeerAction.LowToleranceError, {
            code: errors_1.AttestationErrorCode.INVALID_SIGNATURE,
        });
    }
    // It's important to double check that the attestation still hasn't been observed, since
    // there can be a race-condition if we receive two attestations at the same time and
    // process them in different threads.
    if (chain.seenAggregators.isKnown(targetEpoch, aggregatorIndex)) {
        throw new errors_1.AttestationError(errors_1.GossipAction.IGNORE, null, {
            code: errors_1.AttestationErrorCode.AGGREGATOR_ALREADY_KNOWN,
            targetEpoch,
            aggregatorIndex,
        });
    }
    chain.seenAggregators.add(targetEpoch, aggregatorIndex);
    return { indexedAttestation, committeeIndices };
}
exports.validateGossipAggregateAndProof = validateGossipAggregateAndProof;
//# sourceMappingURL=aggregateAndProof.js.map