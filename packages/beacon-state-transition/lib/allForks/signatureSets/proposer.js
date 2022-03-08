"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProposerSignatureSet = exports.verifyProposerSignature = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const util_1 = require("../../util");
const signatureSets_1 = require("../../util/signatureSets");
function verifyProposerSignature(state, signedBlock) {
    const signatureSet = getProposerSignatureSet(state, signedBlock);
    return (0, signatureSets_1.verifySignatureSet)(signatureSet);
}
exports.verifyProposerSignature = verifyProposerSignature;
function getProposerSignatureSet(state, signedBlock) {
    const { config, epochCtx } = state;
    const domain = state.config.getDomain(lodestar_params_1.DOMAIN_BEACON_PROPOSER, signedBlock.message.slot);
    return {
        type: signatureSets_1.SignatureSetType.single,
        pubkey: epochCtx.index2pubkey[signedBlock.message.proposerIndex],
        signingRoot: (0, util_1.computeSigningRoot)(config.getForkTypes(signedBlock.message.slot).BeaconBlock, signedBlock.message, domain),
        signature: signedBlock.signature.valueOf(),
    };
}
exports.getProposerSignatureSet = getProposerSignatureSet;
//# sourceMappingURL=proposer.js.map