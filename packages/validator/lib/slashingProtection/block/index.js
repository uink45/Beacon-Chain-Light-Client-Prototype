"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashingProtectionBlockService = exports.InvalidBlockErrorCode = exports.InvalidBlockError = exports.BlockBySlotRepository = void 0;
const utils_1 = require("../utils");
const errors_1 = require("./errors");
Object.defineProperty(exports, "InvalidBlockError", { enumerable: true, get: function () { return errors_1.InvalidBlockError; } });
Object.defineProperty(exports, "InvalidBlockErrorCode", { enumerable: true, get: function () { return errors_1.InvalidBlockErrorCode; } });
const blockBySlotRepository_1 = require("./blockBySlotRepository");
Object.defineProperty(exports, "BlockBySlotRepository", { enumerable: true, get: function () { return blockBySlotRepository_1.BlockBySlotRepository; } });
var SafeStatus;
(function (SafeStatus) {
    SafeStatus["SAME_DATA"] = "SAFE_STATUS_SAME_DATA";
    SafeStatus["OK"] = "SAFE_STATUS_OK";
})(SafeStatus || (SafeStatus = {}));
class SlashingProtectionBlockService {
    constructor(blockBySlot) {
        this.blockBySlot = blockBySlot;
    }
    /**
     * Check a block proposal for slash safety, and if it is safe, record it in the database.
     * This is the safe, externally-callable interface for checking block proposals.
     */
    async checkAndInsertBlockProposal(pubkey, block) {
        const safeStatus = await this.checkBlockProposal(pubkey, block);
        if (safeStatus != SafeStatus.SAME_DATA) {
            await this.insertBlockProposal(pubkey, block);
        }
        // TODO: Implement safe clean-up of stored blocks
    }
    /**
     * Check a block proposal from `pubKey` for slash safety.
     */
    async checkBlockProposal(pubkey, block) {
        // Double proposal
        const sameSlotBlock = await this.blockBySlot.get(pubkey, block.slot);
        if (sameSlotBlock && block.slot === sameSlotBlock.slot) {
            // Interchange format allows for blocks without signing_root, then assume root is equal
            if ((0, utils_1.isEqualNonZeroRoot)(sameSlotBlock.signingRoot, block.signingRoot)) {
                return SafeStatus.SAME_DATA;
            }
            else {
                throw new errors_1.InvalidBlockError({
                    code: errors_1.InvalidBlockErrorCode.DOUBLE_BLOCK_PROPOSAL,
                    block,
                    block2: sameSlotBlock,
                });
            }
        }
        // Refuse to sign any block with slot <= min(b.slot for b in data.signed_blocks if b.pubkey == proposer_pubkey),
        // except if it is a repeat signing as determined by the signing_root.
        // (spec v4, Slashing Protection Database Interchange Format)
        const minBlock = await this.blockBySlot.getFirst(pubkey);
        if (minBlock && block.slot <= minBlock.slot) {
            throw new errors_1.InvalidBlockError({
                code: errors_1.InvalidBlockErrorCode.SLOT_LESS_THAN_LOWER_BOUND,
                slot: block.slot,
                minSlot: minBlock.slot,
            });
        }
        return SafeStatus.OK;
    }
    /**
     * Insert a block proposal into the slashing database
     * This should *only* be called in the same (exclusive) transaction as `checkBlockProposal`
     * so that the check isn't invalidated by a concurrent mutation
     */
    async insertBlockProposal(pubkey, block) {
        await this.blockBySlot.set(pubkey, [block]);
    }
    /**
     * Interchange import / export functionality
     */
    async importBlocks(pubkey, blocks) {
        await this.blockBySlot.set(pubkey, blocks);
    }
    /**
     * Interchange import / export functionality
     */
    async exportBlocks(pubkey) {
        return this.blockBySlot.getAll(pubkey);
    }
    async listPubkeys() {
        return await this.blockBySlot.listPubkeys();
    }
}
exports.SlashingProtectionBlockService = SlashingProtectionBlockService;
//# sourceMappingURL=index.js.map