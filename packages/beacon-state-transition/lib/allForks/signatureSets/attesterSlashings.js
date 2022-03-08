"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttesterSlashingsSignatureSets = exports.getAttesterSlashingSignatureSets = void 0;
const ssz_1 = require("@chainsafe/ssz");
const indexedAttestation_1 = require("./indexedAttestation");
/** Get signature sets from a single AttesterSlashing object */
function getAttesterSlashingSignatureSets(state, attesterSlashing) {
    return [attesterSlashing.attestation1, attesterSlashing.attestation2].map((attestation) => (0, indexedAttestation_1.getIndexedAttestationSignatureSet)(state, attestation));
}
exports.getAttesterSlashingSignatureSets = getAttesterSlashingSignatureSets;
/** Get signature sets from all AttesterSlashing objects in a block */
function getAttesterSlashingsSignatureSets(state, signedBlock) {
    return Array.from((0, ssz_1.readonlyValues)(signedBlock.message.body.attesterSlashings), (attesterSlashing) => getAttesterSlashingSignatureSets(state, attesterSlashing)).flat(1);
}
exports.getAttesterSlashingsSignatureSets = getAttesterSlashingsSignatureSets;
//# sourceMappingURL=attesterSlashings.js.map