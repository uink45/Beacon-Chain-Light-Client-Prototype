"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBlockErrorType = exports.ChainSegmentError = exports.BlockError = exports.BlockGossipError = exports.BlockErrorCode = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const ssz_1 = require("@chainsafe/ssz");
const gossipValidation_1 = require("./gossipValidation");
var BlockErrorCode;
(function (BlockErrorCode) {
    /** The prestate cannot be fetched */
    BlockErrorCode["PRESTATE_MISSING"] = "BLOCK_ERROR_PRESTATE_MISSING";
    /** The parent block was unknown. */
    BlockErrorCode["PARENT_UNKNOWN"] = "BLOCK_ERROR_PARENT_UNKNOWN";
    /** The block slot is greater than the present slot. */
    BlockErrorCode["FUTURE_SLOT"] = "BLOCK_ERROR_FUTURE_SLOT";
    /** The block state_root does not match the generated state. */
    BlockErrorCode["STATE_ROOT_MISMATCH"] = "BLOCK_ERROR_STATE_ROOT_MISMATCH";
    /** The block was a genesis block, these blocks cannot be re-imported. */
    BlockErrorCode["GENESIS_BLOCK"] = "BLOCK_ERROR_GENESIS_BLOCK";
    /** The slot is finalized, no need to import. */
    BlockErrorCode["WOULD_REVERT_FINALIZED_SLOT"] = "BLOCK_ERROR_WOULD_REVERT_FINALIZED_SLOT";
    /** Block is already known, no need to re-import. */
    BlockErrorCode["ALREADY_KNOWN"] = "BLOCK_ERROR_ALREADY_KNOWN";
    /** A block for this proposer and slot has already been observed. */
    BlockErrorCode["REPEAT_PROPOSAL"] = "BLOCK_ERROR_REPEAT_PROPOSAL";
    /** The block slot exceeds the MAXIMUM_BLOCK_SLOT_NUMBER. */
    BlockErrorCode["BLOCK_SLOT_LIMIT_REACHED"] = "BLOCK_ERROR_BLOCK_SLOT_LIMIT_REACHED";
    /** The `BeaconBlock` has a `proposer_index` that does not match the index we computed locally. */
    BlockErrorCode["INCORRECT_PROPOSER"] = "BLOCK_ERROR_INCORRECT_PROPOSER";
    /** The proposal signature in invalid. */
    BlockErrorCode["PROPOSAL_SIGNATURE_INVALID"] = "BLOCK_ERROR_PROPOSAL_SIGNATURE_INVALID";
    /** The `block.proposer_index` is not known. */
    BlockErrorCode["UNKNOWN_PROPOSER"] = "BLOCK_ERROR_UNKNOWN_PROPOSER";
    /** A signature in the block is invalid (exactly which is unknown). */
    BlockErrorCode["INVALID_SIGNATURE"] = "BLOCK_ERROR_INVALID_SIGNATURE";
    /** Block transition returns invalid state root. */
    BlockErrorCode["INVALID_STATE_ROOT"] = "BLOCK_ERROR_INVALID_STATE_ROOT";
    /** Block (its parent) is not a descendant of current finalized block */
    BlockErrorCode["NOT_FINALIZED_DESCENDANT"] = "BLOCK_ERROR_NOT_FINALIZED_DESCENDANT";
    /** The provided block is from an later slot than its parent. */
    BlockErrorCode["NOT_LATER_THAN_PARENT"] = "BLOCK_ERROR_NOT_LATER_THAN_PARENT";
    /** At least one block in the chain segment did not have it's parent root set to the root of the prior block. */
    BlockErrorCode["NON_LINEAR_PARENT_ROOTS"] = "BLOCK_ERROR_NON_LINEAR_PARENT_ROOTS";
    /** The slots of the blocks in the chain segment were not strictly increasing. */
    BlockErrorCode["NON_LINEAR_SLOTS"] = "BLOCK_ERROR_NON_LINEAR_SLOTS";
    /** The block failed the specification's `per_block_processing` function, it is invalid. */
    BlockErrorCode["PER_BLOCK_PROCESSING_ERROR"] = "BLOCK_ERROR_PER_BLOCK_PROCESSING_ERROR";
    /** There was an error whilst processing the block. It is not necessarily invalid. */
    BlockErrorCode["BEACON_CHAIN_ERROR"] = "BLOCK_ERROR_BEACON_CHAIN_ERROR";
    /** Block did not pass validation during block processing. */
    BlockErrorCode["KNOWN_BAD_BLOCK"] = "BLOCK_ERROR_KNOWN_BAD_BLOCK";
    // Merge p2p
    /** executionPayload.timestamp is not the expected value */
    BlockErrorCode["INCORRECT_TIMESTAMP"] = "BLOCK_ERROR_INCORRECT_TIMESTAMP";
    /** executionPayload.gasUsed > executionPayload.gasLimit */
    BlockErrorCode["TOO_MUCH_GAS_USED"] = "BLOCK_ERROR_TOO_MUCH_GAS_USED";
    /** executionPayload.blockHash == executionPayload.parentHash */
    BlockErrorCode["SAME_PARENT_HASH"] = "BLOCK_ERROR_SAME_PARENT_HASH";
    /** Total size of executionPayload.transactions exceed a sane limit to prevent DOS attacks */
    BlockErrorCode["TRANSACTIONS_TOO_BIG"] = "BLOCK_ERROR_TRANSACTIONS_TOO_BIG";
    /** Execution engine is unavailable, syncing, or api call errored. Peers must not be downscored on this code */
    BlockErrorCode["EXECUTION_ENGINE_ERROR"] = "BLOCK_ERROR_EXECUTION_ERROR";
})(BlockErrorCode = exports.BlockErrorCode || (exports.BlockErrorCode = {}));
class BlockGossipError extends gossipValidation_1.GossipActionError {
}
exports.BlockGossipError = BlockGossipError;
class BlockError extends lodestar_utils_1.LodestarError {
    constructor(signedBlock, type) {
        super(type);
        this.signedBlock = signedBlock;
    }
    getMetadata() {
        return renderBlockErrorType(this.type);
    }
}
exports.BlockError = BlockError;
class ChainSegmentError extends lodestar_utils_1.LodestarError {
    constructor(signedBlock, type, importedBlocks) {
        super(type);
        this.signedBlock = signedBlock;
        this.importedBlocks = importedBlocks;
    }
    getMetadata() {
        return renderBlockErrorType(this.type);
    }
}
exports.ChainSegmentError = ChainSegmentError;
function renderBlockErrorType(type) {
    switch (type.code) {
        case BlockErrorCode.PRESTATE_MISSING:
        case BlockErrorCode.PER_BLOCK_PROCESSING_ERROR:
        case BlockErrorCode.BEACON_CHAIN_ERROR:
            return {
                error: type.error.message,
            };
        case BlockErrorCode.INVALID_SIGNATURE:
            return {};
        case BlockErrorCode.INVALID_STATE_ROOT:
            return {
                root: (0, ssz_1.toHexString)(type.root),
                expectedRoot: (0, ssz_1.toHexString)(type.expectedRoot),
            };
        default:
            return type;
    }
}
exports.renderBlockErrorType = renderBlockErrorType;
//# sourceMappingURL=blockError.js.map