import { BLSPubkey, Slot } from "@chainsafe/lodestar-types";
import { Bucket, IDatabaseApiOptions } from "@chainsafe/lodestar-db";
import { Type } from "@chainsafe/ssz";
import { LodestarValidatorDatabaseController } from "../../types";
import { SlashingProtectionBlock } from "../types";
/**
 * Manages validator db storage of blocks.
 * Entries in the db are indexed by an encoded key which combines the validator's public key and the
 * block's slot.
 */
export declare class BlockBySlotRepository {
    protected type: Type<SlashingProtectionBlock>;
    protected db: LodestarValidatorDatabaseController;
    protected bucket: Bucket;
    constructor(opts: IDatabaseApiOptions);
    getAll(pubkey: BLSPubkey, limit?: number): Promise<SlashingProtectionBlock[]>;
    getFirst(pubkey: BLSPubkey): Promise<SlashingProtectionBlock | null>;
    get(pubkey: BLSPubkey, slot: Slot): Promise<SlashingProtectionBlock | null>;
    set(pubkey: BLSPubkey, blocks: SlashingProtectionBlock[]): Promise<void>;
    listPubkeys(): Promise<BLSPubkey[]>;
    private encodeKey;
    private decodeKey;
}
//# sourceMappingURL=blockBySlotRepository.d.ts.map