"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBlockSignatureSetsExceptProposer = exports.getAllBlockSignatureSets = void 0;
const util_1 = require("../../util");
const proposerSlashings_1 = require("./proposerSlashings");
const attesterSlashings_1 = require("./attesterSlashings");
const indexedAttestation_1 = require("./indexedAttestation");
const proposer_1 = require("./proposer");
const randao_1 = require("./randao");
const voluntaryExits_1 = require("./voluntaryExits");
const processSyncCommittee_1 = require("../../altair/block/processSyncCommittee");
__exportStar(require("./attesterSlashings"), exports);
__exportStar(require("./indexedAttestation"), exports);
__exportStar(require("./proposer"), exports);
__exportStar(require("./proposerSlashings"), exports);
__exportStar(require("./randao"), exports);
__exportStar(require("./voluntaryExits"), exports);
/**
 * Includes all signatures on the block (except the deposit signatures) for verification.
 * Deposits are not included because they can legally have invalid signatures.
 */
function getAllBlockSignatureSets(state, signedBlock) {
    return [(0, proposer_1.getProposerSignatureSet)(state, signedBlock), ...getAllBlockSignatureSetsExceptProposer(state, signedBlock)];
}
exports.getAllBlockSignatureSets = getAllBlockSignatureSets;
/**
 * Includes all signatures on the block (except the deposit signatures) for verification.
 * Useful since block proposer signature is verified beforehand on gossip validation
 */
function getAllBlockSignatureSetsExceptProposer(state, signedBlock) {
    const signatureSets = [
        (0, randao_1.getRandaoRevealSignatureSet)(state, signedBlock.message),
        ...(0, proposerSlashings_1.getProposerSlashingsSignatureSets)(state, signedBlock),
        ...(0, attesterSlashings_1.getAttesterSlashingsSignatureSets)(state, signedBlock),
        ...(0, indexedAttestation_1.getAttestationsSignatureSets)(state, signedBlock),
        ...(0, voluntaryExits_1.getVoluntaryExitsSignatureSets)(state, signedBlock),
    ];
    // Only after altair fork, validate tSyncCommitteeSignature
    if ((0, util_1.computeEpochAtSlot)(signedBlock.message.slot) >= state.config.ALTAIR_FORK_EPOCH) {
        const syncCommitteeSignatureSet = (0, processSyncCommittee_1.getSyncCommitteeSignatureSet)(state, signedBlock.message);
        // There may be no participants in this syncCommitteeSignature, so it must not be validated
        if (syncCommitteeSignatureSet) {
            signatureSets.push(syncCommitteeSignatureSet);
        }
    }
    return signatureSets;
}
exports.getAllBlockSignatureSetsExceptProposer = getAllBlockSignatureSetsExceptProposer;
//# sourceMappingURL=index.js.map