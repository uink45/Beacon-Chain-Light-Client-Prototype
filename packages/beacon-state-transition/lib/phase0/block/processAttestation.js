"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkpointToStr = exports.validateAttestation = exports.processAttestation = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const util_1 = require("../../util");
const block_1 = require("../../allForks/block");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const ssz_1 = require("@chainsafe/ssz");
/**
 * Process an Attestation operation. Validates an attestation and appends it to state.currentEpochAttestations or
 * state.previousEpochAttestations to be processed in bulk at the epoch transition.
 *
 * PERF: Work depends on number of Attestation per block. On mainnet the average is 89.7 / block, with 87.8 participant
 * true bits on average. See `packages/beacon-state-transition/test/perf/analyzeBlocks.ts`
 */
function processAttestation(state, attestation, verifySignature = true) {
    const { epochCtx } = state;
    const slot = state.slot;
    const data = attestation.data;
    validateAttestation(state, attestation);
    const pendingAttestation = lodestar_types_1.ssz.phase0.PendingAttestation.createTreeBackedFromStruct({
        data: data,
        aggregationBits: attestation.aggregationBits,
        inclusionDelay: slot - data.slot,
        proposerIndex: epochCtx.getBeaconProposer(slot),
    });
    if (data.target.epoch === epochCtx.currentShuffling.epoch) {
        if (!lodestar_types_1.ssz.phase0.Checkpoint.equals(data.source, state.currentJustifiedCheckpoint)) {
            throw new Error(`Attestation source does not equal current justified checkpoint: source=${checkpointToStr(data.source)} currentJustifiedCheckpoint=${checkpointToStr(state.currentJustifiedCheckpoint)}`);
        }
        state.currentEpochAttestations.push(pendingAttestation);
    }
    else {
        if (!lodestar_types_1.ssz.phase0.Checkpoint.equals(data.source, state.previousJustifiedCheckpoint)) {
            throw new Error(`Attestation source does not equal previous justified checkpoint: source=${checkpointToStr(data.source)} previousJustifiedCheckpoint=${checkpointToStr(state.previousJustifiedCheckpoint)}`);
        }
        state.previousEpochAttestations.push(pendingAttestation);
    }
    if (!(0, block_1.isValidIndexedAttestation)(state, epochCtx.getIndexedAttestation(attestation), verifySignature)) {
        throw new Error("Attestation is not valid");
    }
}
exports.processAttestation = processAttestation;
function validateAttestation(state, attestation) {
    const { epochCtx } = state;
    const slot = state.slot;
    const data = attestation.data;
    const computedEpoch = (0, util_1.computeEpochAtSlot)(data.slot);
    const committeeCount = epochCtx.getCommitteeCountPerSlot(computedEpoch);
    if (!(data.index < committeeCount)) {
        throw new Error("Attestation committee index not within current committee count: " +
            `committeeIndex=${data.index} committeeCount=${committeeCount}`);
    }
    if (!(data.target.epoch === epochCtx.previousShuffling.epoch || data.target.epoch === epochCtx.currentShuffling.epoch)) {
        throw new Error("Attestation target epoch not in previous or current epoch: " +
            `targetEpoch=${data.target.epoch} currentEpoch=${epochCtx.currentShuffling.epoch}`);
    }
    if (!(data.target.epoch === computedEpoch)) {
        throw new Error("Attestation target epoch does not match epoch computed from slot: " +
            `targetEpoch=${data.target.epoch} computedEpoch=${computedEpoch}`);
    }
    if (!(data.slot + lodestar_params_1.MIN_ATTESTATION_INCLUSION_DELAY <= slot && slot <= data.slot + lodestar_params_1.SLOTS_PER_EPOCH)) {
        throw new Error("Attestation slot not within inclusion window: " +
            `slot=${data.slot} window=${data.slot + lodestar_params_1.MIN_ATTESTATION_INCLUSION_DELAY}..${data.slot + lodestar_params_1.SLOTS_PER_EPOCH}`);
    }
    const committee = epochCtx.getBeaconCommittee(data.slot, data.index);
    if (attestation.aggregationBits.length !== committee.length) {
        throw new Error("Attestation aggregation bits length does not match committee length: " +
            `aggregationBitsLength=${attestation.aggregationBits.length} committeeLength=${committee.length}`);
    }
}
exports.validateAttestation = validateAttestation;
function checkpointToStr(checkpoint) {
    return `${(0, ssz_1.toHexString)(checkpoint.root)}:${checkpoint.epoch}`;
}
exports.checkpointToStr = checkpointToStr;
//# sourceMappingURL=processAttestation.js.map