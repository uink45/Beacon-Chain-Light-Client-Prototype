"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLowestPendingUnknownParents = exports.getDescendantBlocks = exports.getAllDescendantBlocks = void 0;
const map_1 = require("../../util/map");
const interface_1 = require("../interface");
function getAllDescendantBlocks(blockRootHex, blocks) {
    // Do one pass over all blocks to index by parent
    const byParent = new map_1.MapDef(() => []);
    for (const block of blocks.values()) {
        byParent.getOrDefault(block.parentBlockRootHex).push(block);
    }
    // Then, do a second pass recursively to get `blockRootHex` child blocks
    return addToDescendantBlocks(blockRootHex, byParent);
}
exports.getAllDescendantBlocks = getAllDescendantBlocks;
/** Recursive function for `getAllDescendantBlocks()` */
function addToDescendantBlocks(childBlockRootHex, byParent, descendantBlocks = []) {
    const firstDescendantBlocks = byParent.get(childBlockRootHex);
    if (firstDescendantBlocks) {
        for (const firstDescendantBlock of firstDescendantBlocks) {
            descendantBlocks.push(firstDescendantBlock);
            addToDescendantBlocks(firstDescendantBlock.blockRootHex, byParent, descendantBlocks);
        }
    }
    return descendantBlocks;
}
function getDescendantBlocks(blockRootHex, blocks) {
    const descendantBlocks = [];
    for (const block of blocks.values()) {
        if (block.parentBlockRootHex === blockRootHex) {
            descendantBlocks.push(block);
        }
    }
    return descendantBlocks;
}
exports.getDescendantBlocks = getDescendantBlocks;
function getLowestPendingUnknownParents(blocks) {
    const blocksToFetch = [];
    for (const block of blocks.values()) {
        if (block.status === interface_1.PendingBlockStatus.pending && !blocks.has(block.parentBlockRootHex)) {
            blocksToFetch.push(block);
        }
    }
    return blocksToFetch;
}
exports.getLowestPendingUnknownParents = getLowestPendingUnknownParents;
//# sourceMappingURL=pendingBlocksTree.js.map