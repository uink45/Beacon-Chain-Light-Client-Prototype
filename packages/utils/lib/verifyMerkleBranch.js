"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMerkleBranch = exports.hash = void 0;
const as_sha256_1 = __importDefault(require("@chainsafe/as-sha256"));
function hash(...inputs) {
    return as_sha256_1.default.digest(Buffer.concat(inputs));
}
exports.hash = hash;
/**
 * Verify that the given ``leaf`` is on the merkle branch ``proof``
 * starting with the given ``root``.
 */
function verifyMerkleBranch(leaf, proof, depth, index, root) {
    let value = leaf;
    for (let i = 0; i < depth; i++) {
        if (Math.floor(index / 2 ** i) % 2) {
            value = as_sha256_1.default.digest64(Buffer.concat([proof[i], value]));
        }
        else {
            value = as_sha256_1.default.digest64(Buffer.concat([value, proof[i]]));
        }
    }
    return Buffer.from(value).equals(root);
}
exports.verifyMerkleBranch = verifyMerkleBranch;
//# sourceMappingURL=verifyMerkleBranch.js.map