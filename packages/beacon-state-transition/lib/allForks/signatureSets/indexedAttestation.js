"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttestationsSignatureSets = exports.getIndexedAttestationSignatureSet = exports.getAttestationWithIndicesSignatureSet = exports.verifyIndexedAttestationSignature = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
const util_1 = require("../../util");
function verifyIndexedAttestationSignature(state, indexedAttestation, indices) {
    return (0, util_1.verifySignatureSet)(getIndexedAttestationSignatureSet(state, indexedAttestation, indices));
}
exports.verifyIndexedAttestationSignature = verifyIndexedAttestationSignature;
function getAttestationWithIndicesSignatureSet(state, attestation, indices) {
    const { epochCtx } = state;
    const slot = (0, util_1.computeStartSlotAtEpoch)(attestation.data.target.epoch);
    const domain = state.config.getDomain(lodestar_params_1.DOMAIN_BEACON_ATTESTER, slot);
    return {
        type: util_1.SignatureSetType.aggregate,
        pubkeys: indices.map((i) => epochCtx.index2pubkey[i]),
        signingRoot: (0, util_1.computeSigningRoot)(lodestar_types_1.ssz.phase0.AttestationData, attestation.data, domain),
        signature: attestation.signature.valueOf(),
    };
}
exports.getAttestationWithIndicesSignatureSet = getAttestationWithIndicesSignatureSet;
function getIndexedAttestationSignatureSet(state, indexedAttestation, indices) {
    return getAttestationWithIndicesSignatureSet(state, indexedAttestation, indices !== null && indices !== void 0 ? indices : Array.from((0, ssz_1.readonlyValues)(indexedAttestation.attestingIndices)));
}
exports.getIndexedAttestationSignatureSet = getIndexedAttestationSignatureSet;
function getAttestationsSignatureSets(state, signedBlock) {
    return Array.from((0, ssz_1.readonlyValues)(signedBlock.message.body.attestations), (attestation) => getIndexedAttestationSignatureSet(state, state.getIndexedAttestation(attestation)));
}
exports.getAttestationsSignatureSets = getAttestationsSignatureSets;
//# sourceMappingURL=indexedAttestation.js.map