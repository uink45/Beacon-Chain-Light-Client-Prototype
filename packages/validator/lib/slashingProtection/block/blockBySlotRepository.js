"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockBySlotRepository = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const ssz_1 = require("@chainsafe/ssz");
const utils_1 = require("../utils");
/**
 * Manages validator db storage of blocks.
 * Entries in the db are indexed by an encoded key which combines the validator's public key and the
 * block's slot.
 */
class BlockBySlotRepository {
    constructor(opts) {
        this.bucket = lodestar_db_1.Bucket.phase0_slashingProtectionBlockBySlot;
        this.db = opts.controller;
        this.type = new ssz_1.ContainerType({
            fields: {
                slot: lodestar_types_1.ssz.Slot,
                signingRoot: lodestar_types_1.ssz.Root,
            },
            // Custom type, not in the consensus specs
            casingMap: {
                slot: "slot",
                signingRoot: "signing_root",
            },
        });
    }
    async getAll(pubkey, limit) {
        const blocks = await this.db.values({
            limit,
            gte: this.encodeKey(pubkey, 0),
            lt: this.encodeKey(pubkey, Number.MAX_SAFE_INTEGER),
        });
        return blocks.map((block) => this.type.deserialize(block));
    }
    async getFirst(pubkey) {
        var _a;
        const blocks = await this.getAll(pubkey, 1);
        return (_a = blocks[0]) !== null && _a !== void 0 ? _a : null;
    }
    async get(pubkey, slot) {
        const block = await this.db.get(this.encodeKey(pubkey, slot));
        return block && this.type.deserialize(block);
    }
    async set(pubkey, blocks) {
        await this.db.batchPut(blocks.map((block) => ({
            key: this.encodeKey(pubkey, block.slot),
            value: Buffer.from(this.type.serialize(block)),
        })));
    }
    async listPubkeys() {
        const keys = await this.db.keys();
        return (0, utils_1.uniqueVectorArr)(keys.map((key) => this.decodeKey(key).pubkey));
    }
    encodeKey(pubkey, slot) {
        return (0, lodestar_db_1.encodeKey)(this.bucket, Buffer.concat([Buffer.from(pubkey), (0, lodestar_utils_1.intToBytes)(BigInt(slot), lodestar_db_1.uintLen, "be")]));
    }
    decodeKey(key) {
        return {
            pubkey: key.slice(lodestar_db_1.DB_PREFIX_LENGTH, lodestar_db_1.DB_PREFIX_LENGTH + utils_1.blsPubkeyLen),
            slot: (0, lodestar_utils_1.bytesToInt)(key.slice(lodestar_db_1.DB_PREFIX_LENGTH, lodestar_db_1.DB_PREFIX_LENGTH + lodestar_db_1.uintLen), "be"),
        };
    }
}
exports.BlockBySlotRepository = BlockBySlotRepository;
//# sourceMappingURL=blockBySlotRepository.js.map