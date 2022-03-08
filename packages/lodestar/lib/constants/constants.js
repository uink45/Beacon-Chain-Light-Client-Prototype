"use strict";
/**
 * @module constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAXIMUM_GOSSIP_CLOCK_DISPARITY_SEC = exports.MAXIMUM_GOSSIP_CLOCK_DISPARITY = exports.MAX_VARINT_BYTES = exports.GRAFFITI_SIZE = exports.EMPTY_SIGNATURE = exports.ZERO_HASH_HEX = exports.ZERO_HASH = exports.FAR_FUTURE_EPOCH = exports.GENESIS_START_SHARD = exports.GENESIS_EPOCH = exports.GENESIS_SLOT = exports.DEPOSIT_CONTRACT_TREE_DEPTH = void 0;
exports.DEPOSIT_CONTRACT_TREE_DEPTH = 2 ** 5; // 32
exports.GENESIS_SLOT = 0;
exports.GENESIS_EPOCH = 0;
exports.GENESIS_START_SHARD = 0;
exports.FAR_FUTURE_EPOCH = Infinity;
exports.ZERO_HASH = Buffer.alloc(32, 0);
exports.ZERO_HASH_HEX = "0x" + "00".repeat(32);
exports.EMPTY_SIGNATURE = Buffer.alloc(96, 0);
exports.GRAFFITI_SIZE = 32;
exports.MAX_VARINT_BYTES = 10;
/**
 * The maximum milliseconds of clock disparity assumed between honest nodes.
 */
exports.MAXIMUM_GOSSIP_CLOCK_DISPARITY = 500;
exports.MAXIMUM_GOSSIP_CLOCK_DISPARITY_SEC = exports.MAXIMUM_GOSSIP_CLOCK_DISPARITY / 1000;
//# sourceMappingURL=constants.js.map