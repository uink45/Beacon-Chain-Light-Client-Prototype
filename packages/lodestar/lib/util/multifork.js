"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateTypeFromBytes = exports.getSlotFromBytes = exports.getSignedBlockTypeFromBytes = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
/**
 * Slot	uint64
 */
const SLOT_BYTE_COUNT = 8;
/**
 * 4 + 96 = 100
 * ```
 * class SignedBeaconBlock(Container):
 *   message: BeaconBlock [offset - 4 bytes]
 *   signature: BLSSignature [fixed - 96 bytes]
 *
 * class BeaconBlock(Container):
 *   slot: Slot [fixed - 8 bytes]
 *   proposer_index: ValidatorIndex
 *   parent_root: Root
 *   state_root: Root
 *   body: BeaconBlockBody
 * ```
 */
const SLOT_BYTES_POSITION_IN_BLOCK = 100;
/**
 * 8 + 32 = 40
 * ```
 * class BeaconState(Container):
 *   genesis_time: uint64 [fixed - 8 bytes]
 *   genesis_validators_root: Root [fixed - 32 bytes]
 *   slot: Slot [fixed - 8 bytes]
 *   ...
 * ```
 */
const SLOT_BYTES_POSITION_IN_STATE = 40;
function getSignedBlockTypeFromBytes(config, bytes) {
    const slot = getSlotFromBytes(bytes);
    return config.getForkTypes(slot).SignedBeaconBlock;
}
exports.getSignedBlockTypeFromBytes = getSignedBlockTypeFromBytes;
function getSlotFromBytes(bytes) {
    return (0, lodestar_utils_1.bytesToInt)(bytes.slice(SLOT_BYTES_POSITION_IN_BLOCK, SLOT_BYTES_POSITION_IN_BLOCK + SLOT_BYTE_COUNT));
}
exports.getSlotFromBytes = getSlotFromBytes;
function getStateTypeFromBytes(config, bytes) {
    const slot = (0, lodestar_utils_1.bytesToInt)(bytes.slice(SLOT_BYTES_POSITION_IN_STATE, SLOT_BYTES_POSITION_IN_STATE + SLOT_BYTE_COUNT));
    return config.getForkTypes(slot).BeaconState;
}
exports.getStateTypeFromBytes = getStateTypeFromBytes;
//# sourceMappingURL=multifork.js.map