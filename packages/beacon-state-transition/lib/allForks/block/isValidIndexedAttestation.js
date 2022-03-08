"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidIndexedAttestation = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const signatureSets_1 = require("../signatureSets");
/**
 * Check if `indexedAttestation` has sorted and unique indices and a valid aggregate signature.
 */
function isValidIndexedAttestation(state, indexedAttestation, verifySignature = true) {
    const indices = Array.from((0, ssz_1.readonlyValues)(indexedAttestation.attestingIndices));
    // verify max number of indices
    if (!(indices.length > 0 && indices.length <= lodestar_params_1.MAX_VALIDATORS_PER_COMMITTEE)) {
        return false;
    }
    // verify indices are sorted and unique.
    // Just check if they are monotonically increasing,
    // instead of creating a set and sorting it. Should be (O(n)) instead of O(n log(n))
    let prev = -1;
    for (const index of indices) {
        if (index <= prev)
            return false;
        prev = index;
    }
    // check if indices are out of bounds, by checking the highest index (since it is sorted)
    // TODO - SLOW CODE - Does this .length check the tree and is expensive?
    if (indices[indices.length - 1] >= state.validators.length) {
        return false;
    }
    // verify aggregate signature
    if (!verifySignature) {
        return true;
    }
    return (0, signatureSets_1.verifyIndexedAttestationSignature)(state, indexedAttestation, indices);
}
exports.isValidIndexedAttestation = isValidIndexedAttestation;
//# sourceMappingURL=isValidIndexedAttestation.js.map