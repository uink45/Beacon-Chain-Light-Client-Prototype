"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRootIndexKey = exports.getParentRootIndexKey = exports.deleteParentRootIndex = exports.deleteRootIndex = exports.storeParentRootIndex = exports.storeRootIndex = void 0;
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
async function storeRootIndex(db, slot, blockRoot) {
    return db.put(getRootIndexKey(blockRoot), (0, lodestar_utils_1.intToBytes)(slot, 8, "be"));
}
exports.storeRootIndex = storeRootIndex;
async function storeParentRootIndex(db, slot, parentRoot) {
    return db.put(getParentRootIndexKey(parentRoot), (0, lodestar_utils_1.intToBytes)(slot, 8, "be"));
}
exports.storeParentRootIndex = storeParentRootIndex;
async function deleteRootIndex(db, blockType, block) {
    return db.delete(getRootIndexKey(blockType.fields["message"].hashTreeRoot(block.message)));
}
exports.deleteRootIndex = deleteRootIndex;
async function deleteParentRootIndex(db, block) {
    return db.delete(getParentRootIndexKey(block.message.parentRoot));
}
exports.deleteParentRootIndex = deleteParentRootIndex;
function getParentRootIndexKey(parentRoot) {
    return (0, lodestar_db_1.encodeKey)(lodestar_db_1.Bucket.index_blockArchiveParentRootIndex, parentRoot.valueOf());
}
exports.getParentRootIndexKey = getParentRootIndexKey;
function getRootIndexKey(root) {
    return (0, lodestar_db_1.encodeKey)(lodestar_db_1.Bucket.index_blockArchiveRootIndex, root.valueOf());
}
exports.getRootIndexKey = getRootIndexKey;
//# sourceMappingURL=blockArchiveIndex.js.map