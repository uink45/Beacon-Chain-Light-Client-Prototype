"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashBlocks = void 0;
const bytes_1 = require("../../../util/bytes");
/**
 * Hash SignedBeaconBlock in a byte form easy to compare only
 * @param blocks
 * @param config
 */
function hashBlocks(blocks, config) {
    return (0, bytes_1.byteArrayConcat)(blocks.map((block) => config.getForkTypes(block.message.slot).SignedBeaconBlock.hashTreeRoot(block)));
}
exports.hashBlocks = hashBlocks;
//# sourceMappingURL=hashBlocks.js.map