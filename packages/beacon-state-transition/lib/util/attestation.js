"use strict";
/**
 * @module chain/stateTransition/util
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttesterSlashableIndices = exports.isValidAttestationSlot = exports.isSlashableAttestationData = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
/**
 * Check if [[data1]] and [[data2]] are slashable according to Casper FFG rules.
 */
function isSlashableAttestationData(data1, data2) {
    return (
    // Double vote
    (!lodestar_types_1.ssz.phase0.AttestationData.equals(data1, data2) && data1.target.epoch === data2.target.epoch) ||
        // Surround vote
        (data1.source.epoch < data2.source.epoch && data2.target.epoch < data1.target.epoch));
}
exports.isSlashableAttestationData = isSlashableAttestationData;
function isValidAttestationSlot(attestationSlot, currentSlot) {
    return (attestationSlot + lodestar_params_1.MIN_ATTESTATION_INCLUSION_DELAY <= currentSlot && currentSlot <= attestationSlot + lodestar_params_1.SLOTS_PER_EPOCH);
}
exports.isValidAttestationSlot = isValidAttestationSlot;
function getAttesterSlashableIndices(attesterSlashing) {
    const indices = [];
    const attSet1 = new Set(attesterSlashing.attestation1.attestingIndices);
    const attArr2 = attesterSlashing.attestation2.attestingIndices;
    for (let i = 0, len = attArr2.length; i < len; i++) {
        const index = attArr2[i];
        if (attSet1.has(index)) {
            indices.push(index);
        }
    }
    return indices;
}
exports.getAttesterSlashableIndices = getAttesterSlashableIndices;
//# sourceMappingURL=attestation.js.map