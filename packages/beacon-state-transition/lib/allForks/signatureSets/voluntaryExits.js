"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVoluntaryExitsSignatureSets = exports.getVoluntaryExitSignatureSet = exports.verifyVoluntaryExitSignature = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const util_1 = require("../../util");
function verifyVoluntaryExitSignature(state, signedVoluntaryExit) {
    return (0, util_1.verifySignatureSet)(getVoluntaryExitSignatureSet(state, signedVoluntaryExit));
}
exports.verifyVoluntaryExitSignature = verifyVoluntaryExitSignature;
/**
 * Extract signatures to allow validating all block signatures at once
 */
function getVoluntaryExitSignatureSet(state, signedVoluntaryExit) {
    const { epochCtx } = state;
    const slot = (0, util_1.computeStartSlotAtEpoch)(signedVoluntaryExit.message.epoch);
    const domain = state.config.getDomain(lodestar_params_1.DOMAIN_VOLUNTARY_EXIT, slot);
    return {
        type: util_1.SignatureSetType.single,
        pubkey: epochCtx.index2pubkey[signedVoluntaryExit.message.validatorIndex],
        signingRoot: (0, util_1.computeSigningRoot)(lodestar_types_1.ssz.phase0.VoluntaryExit, signedVoluntaryExit.message, domain),
        signature: signedVoluntaryExit.signature.valueOf(),
    };
}
exports.getVoluntaryExitSignatureSet = getVoluntaryExitSignatureSet;
function getVoluntaryExitsSignatureSets(state, signedBlock) {
    return Array.from((0, ssz_1.readonlyValues)(signedBlock.message.body.voluntaryExits), (voluntaryExit) => getVoluntaryExitSignatureSet(state, voluntaryExit));
}
exports.getVoluntaryExitsSignatureSets = getVoluntaryExitsSignatureSets;
//# sourceMappingURL=voluntaryExits.js.map