"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinalizedRootProof = exports.getCurrentSyncCommitteeBranch = exports.getNextSyncCommitteeBranch = exports.getSyncCommitteesWitness = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
function getSyncCommitteesWitness(state) {
    const n1 = state.tree.rootNode;
    const n3 = n1.right; // [1]0110
    const n6 = n3.left; // 1[0]110
    const n13 = n6.right; // 10[1]10
    const n27 = n13.right; // 101[1]0
    const currentSyncCommitteeRoot = n27.left.root; // n54 1011[0]
    const nextSyncCommitteeRoot = n27.right.root; // n55 1011[1]
    // Witness branch is sorted by descending gindex
    const witness = [
        n13.left.root,
        n6.left.root,
        n3.right.root,
        n1.left.root, // 2
    ];
    return {
        witness,
        currentSyncCommitteeRoot,
        nextSyncCommitteeRoot,
    };
}
exports.getSyncCommitteesWitness = getSyncCommitteesWitness;
function getNextSyncCommitteeBranch(syncCommitteesWitness) {
    // Witness branch is sorted by descending gindex
    return [syncCommitteesWitness.currentSyncCommitteeRoot, ...syncCommitteesWitness.witness];
}
exports.getNextSyncCommitteeBranch = getNextSyncCommitteeBranch;
function getCurrentSyncCommitteeBranch(syncCommitteesWitness) {
    // Witness branch is sorted by descending gindex
    return [syncCommitteesWitness.nextSyncCommitteeRoot, ...syncCommitteesWitness.witness];
}
exports.getCurrentSyncCommitteeBranch = getCurrentSyncCommitteeBranch;
function getFinalizedRootProof(state) {
    return state.tree.getSingleProof(BigInt(lodestar_params_1.FINALIZED_ROOT_GINDEX));
}
exports.getFinalizedRootProof = getFinalizedRootProof;
//# sourceMappingURL=proofs.js.map