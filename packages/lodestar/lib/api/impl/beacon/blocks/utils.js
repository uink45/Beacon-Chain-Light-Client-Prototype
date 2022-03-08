"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBlockId = exports.toBeaconHeaderResponse = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const constants_1 = require("../../../../constants");
const ssz_1 = require("@chainsafe/ssz");
const errors_1 = require("../../errors");
function toBeaconHeaderResponse(config, block, canonical = false) {
    return {
        root: config.getForkTypes(block.message.slot).BeaconBlock.hashTreeRoot(block.message),
        canonical,
        header: {
            message: (0, lodestar_beacon_state_transition_1.blockToHeader)(config, block.message),
            signature: block.signature,
        },
    };
}
exports.toBeaconHeaderResponse = toBeaconHeaderResponse;
async function resolveBlockId(forkChoice, db, blockId) {
    const block = await resolveBlockIdOrNull(forkChoice, db, blockId);
    if (!block) {
        throw new errors_1.ApiError(404, `No block found for id '${blockId}'`);
    }
    return block;
}
exports.resolveBlockId = resolveBlockId;
async function resolveBlockIdOrNull(forkChoice, db, blockId) {
    blockId = String(blockId).toLowerCase();
    if (blockId === "head") {
        const head = forkChoice.getHead();
        return db.block.get((0, ssz_1.fromHexString)(head.blockRoot));
    }
    if (blockId === "genesis") {
        return db.blockArchive.get(constants_1.GENESIS_SLOT);
    }
    if (blockId === "finalized") {
        return await db.blockArchive.get(forkChoice.getFinalizedBlock().slot);
    }
    let blockSummary;
    let getBlockByBlockArchive;
    if (blockId.startsWith("0x")) {
        const blockHash = (0, ssz_1.fromHexString)(blockId);
        blockSummary = forkChoice.getBlock(blockHash);
        getBlockByBlockArchive = async () => await db.blockArchive.getByRoot(blockHash);
    }
    else {
        // block id must be slot
        const blockSlot = parseInt(blockId, 10);
        if (isNaN(blockSlot) && isNaN(blockSlot - 0)) {
            throw new errors_1.ValidationError(`Invalid block id '${blockId}'`, "blockId");
        }
        blockSummary = forkChoice.getCanonicalBlockAtSlot(blockSlot);
        getBlockByBlockArchive = async () => await db.blockArchive.get(blockSlot);
    }
    if (blockSummary) {
        // All unfinalized blocks **and the finalized block** are tracked by the fork choice.
        // Unfinalized blocks are stored in the block repository, but the finalized block is in the block archive
        const finalized = forkChoice.getFinalizedBlock();
        if (blockSummary.slot === finalized.slot) {
            return await db.blockArchive.get(finalized.slot);
        }
        else {
            return await db.block.get((0, ssz_1.fromHexString)(blockSummary.blockRoot));
        }
    }
    else {
        // Blocks not in the fork choice are in the block archive
        return await getBlockByBlockArchive();
    }
}
//# sourceMappingURL=utils.js.map