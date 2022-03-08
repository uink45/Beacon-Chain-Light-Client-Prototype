"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertLinearChainSegment = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const errors_1 = require("../../errors");
/**
 * Assert this chain segment of blocks is linear with slot numbers and hashes
 */
function assertLinearChainSegment(config, blocks) {
    for (const [i, block] of blocks.entries()) {
        const child = blocks[i + 1];
        if (child !== undefined) {
            // If this block has a child in this chain segment, ensure that its parent root matches
            // the root of this block.
            if (!lodestar_types_1.ssz.Root.equals(config.getForkTypes(block.message.slot).BeaconBlock.hashTreeRoot(block.message), child.message.parentRoot)) {
                throw new errors_1.BlockError(block, { code: errors_1.BlockErrorCode.NON_LINEAR_PARENT_ROOTS });
            }
            // Ensure that the slots are strictly increasing throughout the chain segment.
            if (child.message.slot <= block.message.slot) {
                throw new errors_1.BlockError(block, { code: errors_1.BlockErrorCode.NON_LINEAR_SLOTS });
            }
        }
    }
}
exports.assertLinearChainSegment = assertLinearChainSegment;
//# sourceMappingURL=chainSegment.js.map