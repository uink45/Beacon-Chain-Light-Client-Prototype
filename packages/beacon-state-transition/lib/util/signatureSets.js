"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignatureSet = exports.SignatureSetType = void 0;
const bls_1 = __importDefault(require("@chainsafe/bls"));
var SignatureSetType;
(function (SignatureSetType) {
    SignatureSetType["single"] = "single";
    SignatureSetType["aggregate"] = "aggregate";
})(SignatureSetType = exports.SignatureSetType || (exports.SignatureSetType = {}));
function verifySignatureSet(signatureSet) {
    // All signatures are not trusted and must be group checked (p2.subgroup_check)
    const signature = bls_1.default.Signature.fromBytes(signatureSet.signature, undefined, true);
    switch (signatureSet.type) {
        case SignatureSetType.single:
            return signature.verify(signatureSet.pubkey, signatureSet.signingRoot.valueOf());
        case SignatureSetType.aggregate:
            return signature.verifyAggregate(signatureSet.pubkeys, signatureSet.signingRoot.valueOf());
        default:
            throw Error("Unknown signature set type");
    }
}
exports.verifySignatureSet = verifySignatureSet;
//# sourceMappingURL=signatureSets.js.map