"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockArchiveRepository = void 0;
const it_all_1 = __importDefault(require("it-all"));
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const multifork_1 = require("../../util/multifork");
const blockArchiveIndex_1 = require("./blockArchiveIndex");
const blockArchiveIndex_2 = require("./blockArchiveIndex");
/**
 * Stores finalized blocks. Block slot is identifier.
 */
class BlockArchiveRepository extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        const type = lodestar_types_1.ssz.phase0.SignedBeaconBlock; // Pick some type but won't be used
        super(config, db, lodestar_db_1.Bucket.allForks_blockArchive, type, metrics);
    }
    // Overrides for multi-fork
    encodeValue(value) {
        return this.config.getForkTypes(value.message.slot).SignedBeaconBlock.serialize(value);
    }
    decodeValue(data) {
        return (0, multifork_1.getSignedBlockTypeFromBytes)(this.config, data).deserialize(data);
    }
    // Handle key as slot
    getId(value) {
        return value.message.slot;
    }
    decodeKey(data) {
        return (0, lodestar_utils_1.bytesToInt)(super.decodeKey(data), "be");
    }
    // Overrides to index
    async put(key, value) {
        const blockRoot = this.config.getForkTypes(value.message.slot).BeaconBlock.hashTreeRoot(value.message);
        const slot = value.message.slot;
        await Promise.all([
            super.put(key, value),
            (0, blockArchiveIndex_2.storeRootIndex)(this.db, slot, blockRoot),
            (0, blockArchiveIndex_2.storeParentRootIndex)(this.db, slot, value.message.parentRoot),
        ]);
    }
    async batchPut(items) {
        await Promise.all([
            super.batchPut(items),
            Array.from(items).map((item) => {
                const slot = item.value.message.slot;
                const blockRoot = this.config.getForkTypes(slot).BeaconBlock.hashTreeRoot(item.value.message);
                return (0, blockArchiveIndex_2.storeRootIndex)(this.db, slot, blockRoot);
            }),
            Array.from(items).map((item) => {
                const slot = item.value.message.slot;
                const parentRoot = item.value.message.parentRoot;
                return (0, blockArchiveIndex_2.storeParentRootIndex)(this.db, slot, parentRoot);
            }),
        ]);
    }
    async batchPutBinary(items) {
        await Promise.all([
            super.batchPutBinary(items),
            Array.from(items).map((item) => (0, blockArchiveIndex_2.storeRootIndex)(this.db, item.slot, item.blockRoot)),
            Array.from(items).map((item) => (0, blockArchiveIndex_2.storeParentRootIndex)(this.db, item.slot, item.parentRoot)),
        ]);
    }
    async remove(value) {
        await Promise.all([
            super.remove(value),
            (0, blockArchiveIndex_2.deleteRootIndex)(this.db, this.config.getForkTypes(value.message.slot).SignedBeaconBlock, value),
            (0, blockArchiveIndex_2.deleteParentRootIndex)(this.db, value),
        ]);
    }
    async batchRemove(values) {
        await Promise.all([
            super.batchRemove(values),
            Array.from(values).map((value) => (0, blockArchiveIndex_2.deleteRootIndex)(this.db, this.config.getForkTypes(value.message.slot).SignedBeaconBlock, value)),
            Array.from(values).map((value) => (0, blockArchiveIndex_2.deleteParentRootIndex)(this.db, value)),
        ]);
    }
    async *valuesStream(opts) {
        const firstSlot = this.getFirstSlot(opts);
        const valuesStream = super.valuesStream(opts);
        const step = (opts && opts.step) || 1;
        for await (const value of valuesStream) {
            if ((value.message.slot - firstSlot) % step === 0) {
                yield value;
            }
        }
    }
    async values(opts) {
        return (0, it_all_1.default)(this.valuesStream(opts));
    }
    // INDEX
    async getByRoot(root) {
        const slot = await this.getSlotByRoot(root);
        return slot !== null ? await this.get(slot) : null;
    }
    async getBinaryEntryByRoot(root) {
        const slot = await this.getSlotByRoot(root);
        return slot !== null ? { key: slot, value: await this.getBinary(slot) } : null;
    }
    async getByParentRoot(root) {
        const slot = await this.getSlotByParentRoot(root);
        return slot !== null ? await this.get(slot) : null;
    }
    async getSlotByRoot(root) {
        return this.parseSlot(await this.db.get((0, blockArchiveIndex_1.getRootIndexKey)(root)));
    }
    async getSlotByParentRoot(root) {
        return this.parseSlot(await this.db.get((0, blockArchiveIndex_1.getParentRootIndexKey)(root)));
    }
    parseSlot(slotBytes) {
        if (!slotBytes)
            return null;
        const slot = (0, lodestar_utils_1.bytesToInt)(slotBytes, "be");
        // TODO: Is this necessary? How can bytesToInt return a non-integer?
        return Number.isInteger(slot) ? slot : null;
    }
    getFirstSlot(opts) {
        const dbFilterOpts = this.dbFilterOptions(opts);
        const firstSlot = dbFilterOpts.gt
            ? this.decodeKey(dbFilterOpts.gt) + 1
            : dbFilterOpts.gte
                ? this.decodeKey(dbFilterOpts.gte)
                : null;
        if (firstSlot === null)
            throw Error("specify opts.gt or opts.gte");
        return firstSlot;
    }
}
exports.BlockArchiveRepository = BlockArchiveRepository;
//# sourceMappingURL=blockArchive.js.map