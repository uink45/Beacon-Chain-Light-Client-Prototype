"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProposerSlashingsSignatureSets = exports.getProposerSlashingSignatureSets = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const util_1 = require("../../util");
/**
 * Extract signatures to allow validating all block signatures at once
 */
function getProposerSlashingSignatureSets(state, proposerSlashing) {
    const { epochCtx } = state;
    const pubkey = epochCtx.index2pubkey[proposerSlashing.signedHeader1.message.proposerIndex];
    return [proposerSlashing.signedHeader1, proposerSlashing.signedHeader2].map((signedHeader) => {
        const domain = state.config.getDomain(lodestar_params_1.DOMAIN_BEACON_PROPOSER, signedHeader.message.slot);
        const beaconBlockHeaderType = lodestar_types_1.ssz.phase0.BeaconBlockHeader;
        return {
            type: util_1.SignatureSetType.single,
            pubkey,
            signingRoot: (0, util_1.computeSigningRoot)(beaconBlockHeaderType, signedHeader.message, domain),
            signature: signedHeader.signature.valueOf(),
        };
    });
}
exports.getProposerSlashingSignatureSets = getProposerSlashingSignatureSets;
function getProposerSlashingsSignatureSets(state, signedBlock) {
    return Array.from((0, ssz_1.readonlyValues)(signedBlock.message.body.proposerSlashings), (proposerSlashing) => getProposerSlashingSignatureSets(state, proposerSlashing)).flat(1);
}
exports.getProposerSlashingsSignatureSets = getProposerSlashingsSignatureSets;
//# sourceMappingURL=proposerSlashings.js.map