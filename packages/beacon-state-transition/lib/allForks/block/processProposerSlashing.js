"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidProposerSlashing = exports.processProposerSlashing = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const util_1 = require("../../util");
const signatureSets_1 = require("../../allForks/signatureSets");
const slashValidator_1 = require("../../allForks/block/slashValidator");
const signatureSets_2 = require("../../util/signatureSets");
/**
 * Process a ProposerSlashing operation. Initiates the exit of a validator, decreases the balance of the slashed
 * validator and increases the block proposer balance.
 *
 * PERF: Work depends on number of ProposerSlashing per block. On regular networks the average is 0 / block.
 */
function processProposerSlashing(fork, state, proposerSlashing, verifySignatures = true) {
    assertValidProposerSlashing(state, proposerSlashing, verifySignatures);
    (0, slashValidator_1.slashValidatorAllForks)(fork, state, proposerSlashing.signedHeader1.message.proposerIndex);
}
exports.processProposerSlashing = processProposerSlashing;
function assertValidProposerSlashing(state, proposerSlashing, verifySignatures = true) {
    const { epochCtx } = state;
    const { BeaconBlockHeader } = lodestar_types_1.ssz.phase0;
    const header1 = proposerSlashing.signedHeader1.message;
    const header2 = proposerSlashing.signedHeader2.message;
    // verify header slots match
    if (header1.slot !== header2.slot) {
        throw new Error(`ProposerSlashing slots do not match: slot1=${header1.slot} slot2=${header2.slot}`);
    }
    // verify header proposer indices match
    if (header1.proposerIndex !== header2.proposerIndex) {
        throw new Error(`ProposerSlashing proposer indices do not match: proposerIndex1=${header1.proposerIndex} proposerIndex2=${header2.proposerIndex}`);
    }
    // verify headers are different
    if (BeaconBlockHeader.equals(header1, header2)) {
        throw new Error("ProposerSlashing headers are equal");
    }
    // verify the proposer is slashable
    const proposer = state.validators[header1.proposerIndex];
    if (!(0, util_1.isSlashableValidator)(proposer, epochCtx.currentShuffling.epoch)) {
        throw new Error("ProposerSlashing proposer is not slashable");
    }
    // verify signatures
    if (verifySignatures) {
        for (const [i, signatureSet] of (0, signatureSets_1.getProposerSlashingSignatureSets)(state, proposerSlashing).entries()) {
            if (!(0, signatureSets_2.verifySignatureSet)(signatureSet)) {
                throw new Error(`ProposerSlashing header${i + 1} signature invalid`);
            }
        }
    }
}
exports.assertValidProposerSlashing = assertValidProposerSlashing;
//# sourceMappingURL=processProposerSlashing.js.map