"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRootIndexKey = exports.storeRootIndex = void 0;
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
function storeRootIndex(db, slot, stateRoot) {
    return db.put(getRootIndexKey(stateRoot), (0, lodestar_utils_1.intToBytes)(slot, 8, "be"));
}
exports.storeRootIndex = storeRootIndex;
function getRootIndexKey(root) {
    return (0, lodestar_db_1.encodeKey)(lodestar_db_1.Bucket.index_stateArchiveRootIndex, root.valueOf());
}
exports.getRootIndexKey = getRootIndexKey;
//# sourceMappingURL=stateArchiveIndex.js.map