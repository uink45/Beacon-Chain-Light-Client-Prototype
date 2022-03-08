"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsafeUint8ArrayToTree = void 0;
const persistent_merkle_tree_1 = require("@chainsafe/persistent-merkle-tree");
/**
 * Convert a Uint8Array to a merkle tree, using the underlying array's underlying ArrayBuffer
 *
 * `data` MUST NOT be modified after this, or risk the merkle nodes being modified.
 */
function unsafeUint8ArrayToTree(data, depth) {
    const leaves = [];
    // Loop 32 bytes at a time, creating leaves from the backing subarray
    const maxStartIndex = data.length - 31;
    for (let i = 0; i < maxStartIndex; i += 32) {
        leaves.push(new persistent_merkle_tree_1.LeafNode(data.subarray(i, i + 32)));
    }
    // If there is any extra data at the end (less than 32 bytes), append a final leaf
    const lengthMod32 = data.length % 32;
    if (lengthMod32 !== 0) {
        const finalChunk = new Uint8Array(32);
        finalChunk.set(data.subarray(data.length - lengthMod32));
        leaves.push(new persistent_merkle_tree_1.LeafNode(finalChunk));
    }
    return (0, persistent_merkle_tree_1.subtreeFillToContents)(leaves, depth);
}
exports.unsafeUint8ArrayToTree = unsafeUint8ArrayToTree;
//# sourceMappingURL=unsafeUint8ArrayToTree.js.map