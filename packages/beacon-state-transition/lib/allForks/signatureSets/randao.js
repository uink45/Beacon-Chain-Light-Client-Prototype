"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandaoRevealSignatureSet = exports.verifyRandaoSignature = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const util_1 = require("../../util");
function verifyRandaoSignature(state, block) {
    return (0, util_1.verifySignatureSet)(getRandaoRevealSignatureSet(state, block));
}
exports.verifyRandaoSignature = verifyRandaoSignature;
/**
 * Extract signatures to allow validating all block signatures at once
 */
function getRandaoRevealSignatureSet(state, block) {
    const { epochCtx } = state;
    // should not get epoch from epochCtx
    const epoch = (0, util_1.computeEpochAtSlot)(block.slot);
    const domain = state.config.getDomain(lodestar_params_1.DOMAIN_RANDAO, block.slot);
    return {
        type: util_1.SignatureSetType.single,
        pubkey: epochCtx.index2pubkey[block.proposerIndex],
        signingRoot: (0, util_1.computeSigningRoot)(lodestar_types_1.ssz.Epoch, epoch, domain),
        signature: block.body.randaoReveal.valueOf(),
    };
}
exports.getRandaoRevealSignatureSet = getRandaoRevealSignatureSet;
//# sourceMappingURL=randao.js.map