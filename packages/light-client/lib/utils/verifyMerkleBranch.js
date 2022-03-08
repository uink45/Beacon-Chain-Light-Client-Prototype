"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidMerkleBranch = exports.SYNC_COMMITTEES_INDEX = exports.SYNC_COMMITTEES_DEPTH = void 0;
const ssz_1 = require("@chainsafe/ssz");
const persistent_merkle_tree_1 = require("@chainsafe/persistent-merkle-tree");
exports.SYNC_COMMITTEES_DEPTH = 4;
exports.SYNC_COMMITTEES_INDEX = 11;
/**
 * Verify that the given ``leaf`` is on the merkle branch ``proof``
 * starting with the given ``root``.
 *
 * Browser friendly version of verifyMerkleBranch
 */
function isValidMerkleBranch(leaf, proof, depth, index, root) {
    let value = leaf;
    for (let i = 0; i < depth; i++) {
        if (Math.floor(index / 2 ** i) % 2) {
            value = (0, persistent_merkle_tree_1.hash)(proof[i], value);
        }
        else {
            value = (0, persistent_merkle_tree_1.hash)(value, proof[i]);
        }
    }
    return (0, ssz_1.byteArrayEquals)(value, root);
}
exports.isValidMerkleBranch = isValidMerkleBranch;
//# sourceMappingURL=verifyMerkleBranch.js.map