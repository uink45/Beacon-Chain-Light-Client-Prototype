"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignatureSetsMaybeBatch = void 0;
const bls_1 = require("@chainsafe/bls");
const MIN_SET_COUNT_TO_BATCH = 2;
/**
 * Verify signatures sets with batch verification or regular core verify depending on the set count.
 * Abstracted in a separate file to be consumed by the threaded pool and the main thread implementation.
 */
function verifySignatureSetsMaybeBatch(sets) {
    if (sets.length >= MIN_SET_COUNT_TO_BATCH) {
        return bls_1.bls.Signature.verifyMultipleSignatures(sets.map((s) => ({
            publicKey: s.publicKey,
            message: s.message,
            // true = validate signature
            signature: bls_1.bls.Signature.fromBytes(s.signature, bls_1.CoordType.affine, true),
        })));
    }
    // .every on an empty array returns true
    if (sets.length === 0) {
        throw Error("Empty signature set");
    }
    // If too few signature sets verify them without batching
    return sets.every((set) => {
        // true = validate signature
        const sig = bls_1.bls.Signature.fromBytes(set.signature, bls_1.CoordType.affine, true);
        return sig.verify(set.publicKey, set.message);
    });
}
exports.verifySignatureSetsMaybeBatch = verifySignatureSetsMaybeBatch;
//# sourceMappingURL=maybeBatch.js.map