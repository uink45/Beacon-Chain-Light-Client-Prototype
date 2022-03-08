"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlocksByRangeError = exports.BlocksByRangeErrorCode = exports.assertSequentialBlocksInRange = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
/**
 * Asserts a response from BeaconBlocksByRange respects the request and is sequential
 * Note: MUST allow missing block for skipped slots.
 */
function assertSequentialBlocksInRange(blocks, { count, startSlot, step }) {
    // Check below would throw for empty ranges
    if (blocks.length === 0) {
        return;
    }
    const length = blocks.length;
    if (length > count) {
        throw new BlocksByRangeError({ code: BlocksByRangeErrorCode.BAD_LENGTH, count, length });
    }
    const maxSlot = startSlot + count * (step || 1) - 1;
    const firstSlot = blocks[0].message.slot;
    const lastSlot = blocks[blocks.length - 1].message.slot;
    if (firstSlot < startSlot) {
        throw new BlocksByRangeError({ code: BlocksByRangeErrorCode.UNDER_START_SLOT, startSlot, firstSlot });
    }
    if (lastSlot > maxSlot) {
        throw new BlocksByRangeError({ code: BlocksByRangeErrorCode.OVER_MAX_SLOT, maxSlot, lastSlot });
    }
    // Assert sequential with request.step
    for (let i = 0; i < blocks.length - 1; i++) {
        const slotL = blocks[i].message.slot;
        const slotR = blocks[i + 1].message.slot;
        if (slotL + step > slotR) {
            throw new BlocksByRangeError({ code: BlocksByRangeErrorCode.BAD_SEQUENCE, step, slotL, slotR });
        }
    }
}
exports.assertSequentialBlocksInRange = assertSequentialBlocksInRange;
var BlocksByRangeErrorCode;
(function (BlocksByRangeErrorCode) {
    BlocksByRangeErrorCode["BAD_LENGTH"] = "BLOCKS_BY_RANGE_ERROR_BAD_LENGTH";
    BlocksByRangeErrorCode["UNDER_START_SLOT"] = "BLOCKS_BY_RANGE_ERROR_UNDER_START_SLOT";
    BlocksByRangeErrorCode["OVER_MAX_SLOT"] = "BLOCKS_BY_RANGE_ERROR_OVER_MAX_SLOT";
    BlocksByRangeErrorCode["BAD_SEQUENCE"] = "BLOCKS_BY_RANGE_ERROR_BAD_SEQUENCE";
})(BlocksByRangeErrorCode = exports.BlocksByRangeErrorCode || (exports.BlocksByRangeErrorCode = {}));
class BlocksByRangeError extends lodestar_utils_1.LodestarError {
}
exports.BlocksByRangeError = BlocksByRangeError;
//# sourceMappingURL=assertSequentialBlocksInRange.js.map