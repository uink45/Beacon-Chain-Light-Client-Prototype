import { BLSPubkey } from "@chainsafe/lodestar-types";
import { InvalidBlockError, InvalidBlockErrorCode } from "./errors";
import { BlockBySlotRepository } from "./blockBySlotRepository";
import { SlashingProtectionBlock } from "../types";
export { BlockBySlotRepository, InvalidBlockError, InvalidBlockErrorCode };
declare enum SafeStatus {
    SAME_DATA = "SAFE_STATUS_SAME_DATA",
    OK = "SAFE_STATUS_OK"
}
export declare class SlashingProtectionBlockService {
    private blockBySlot;
    constructor(blockBySlot: BlockBySlotRepository);
    /**
     * Check a block proposal for slash safety, and if it is safe, record it in the database.
     * This is the safe, externally-callable interface for checking block proposals.
     */
    checkAndInsertBlockProposal(pubkey: BLSPubkey, block: SlashingProtectionBlock): Promise<void>;
    /**
     * Check a block proposal from `pubKey` for slash safety.
     */
    checkBlockProposal(pubkey: BLSPubkey, block: SlashingProtectionBlock): Promise<SafeStatus>;
    /**
     * Insert a block proposal into the slashing database
     * This should *only* be called in the same (exclusive) transaction as `checkBlockProposal`
     * so that the check isn't invalidated by a concurrent mutation
     */
    insertBlockProposal(pubkey: BLSPubkey, block: SlashingProtectionBlock): Promise<void>;
    /**
     * Interchange import / export functionality
     */
    importBlocks(pubkey: BLSPubkey, blocks: SlashingProtectionBlock[]): Promise<void>;
    /**
     * Interchange import / export functionality
     */
    exportBlocks(pubkey: BLSPubkey): Promise<SlashingProtectionBlock[]>;
    listPubkeys(): Promise<BLSPubkey[]>;
}
//# sourceMappingURL=index.d.ts.map