"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidAttesterSlashing = exports.processAttesterSlashing = void 0;
const util_1 = require("../../util");
const isValidIndexedAttestation_1 = require("./isValidIndexedAttestation");
const slashValidator_1 = require("./slashValidator");
/**
 * Process an AttesterSlashing operation. Initiates the exit of a validator, decreases the balance of the slashed
 * validators and increases the block proposer balance.
 *
 * PERF: Work depends on number of AttesterSlashing per block. On regular networks the average is 0 / block.
 */
function processAttesterSlashing(fork, state, attesterSlashing, verifySignatures = true) {
    assertValidAttesterSlashing(state, attesterSlashing, verifySignatures);
    const intersectingIndices = (0, util_1.getAttesterSlashableIndices)(attesterSlashing);
    let slashedAny = false;
    const validators = state.validators; // Get the validators sub tree once for all indices
    // Spec requires to sort indexes beforehand
    for (const index of intersectingIndices.sort((a, b) => a - b)) {
        if ((0, util_1.isSlashableValidator)(validators[index], state.epochCtx.currentShuffling.epoch)) {
            (0, slashValidator_1.slashValidatorAllForks)(fork, state, index);
            slashedAny = true;
        }
    }
    if (!slashedAny) {
        throw new Error("AttesterSlashing did not result in any slashings");
    }
}
exports.processAttesterSlashing = processAttesterSlashing;
function assertValidAttesterSlashing(state, attesterSlashing, verifySignatures = true) {
    const attestation1 = attesterSlashing.attestation1;
    const attestation2 = attesterSlashing.attestation2;
    if (!(0, util_1.isSlashableAttestationData)(attestation1.data, attestation2.data)) {
        throw new Error("AttesterSlashing is not slashable");
    }
    if (!(0, isValidIndexedAttestation_1.isValidIndexedAttestation)(state, attestation1, verifySignatures)) {
        throw new Error("AttesterSlashing attestation1 is not a valid IndexedAttestation");
    }
    if (!(0, isValidIndexedAttestation_1.isValidIndexedAttestation)(state, attestation2, verifySignatures)) {
        throw new Error("AttesterSlashing attestation2 is not a valid IndexedAttestation");
    }
}
exports.assertValidAttesterSlashing = assertValidAttesterSlashing;
//# sourceMappingURL=processAttesterSlashing.js.map