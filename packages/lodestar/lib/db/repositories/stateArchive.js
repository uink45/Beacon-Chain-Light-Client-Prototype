"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateArchiveRepository = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const multifork_1 = require("../../util/multifork");
const stateArchiveIndex_1 = require("./stateArchiveIndex");
/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
class StateArchiveRepository extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        // Pick some type but won't be used
        const type = lodestar_types_1.ssz.phase0.BeaconState;
        super(config, db, lodestar_db_1.Bucket.allForks_stateArchive, type, metrics);
    }
    // Overrides for multi-fork
    encodeValue(value) {
        return this.config.getForkTypes(value.slot).BeaconState.serialize(value);
    }
    decodeValue(data) {
        return (0, multifork_1.getStateTypeFromBytes)(this.config, data).createTreeBackedFromBytes(data);
    }
    // Handle key as slot
    async put(key, value) {
        await Promise.all([super.put(key, value), (0, stateArchiveIndex_1.storeRootIndex)(this.db, key, value.hashTreeRoot())]);
    }
    getId(state) {
        return state.slot;
    }
    decodeKey(data) {
        return (0, lodestar_utils_1.bytesToInt)(super.decodeKey(data), "be");
    }
    // Index Root -> Slot
    async getByRoot(stateRoot) {
        const slot = await this.getSlotByRoot(stateRoot);
        if (slot !== null && Number.isInteger(slot)) {
            return this.get(slot);
        }
        return null;
    }
    async getSlotByRoot(root) {
        const value = await this.db.get((0, stateArchiveIndex_1.getRootIndexKey)(root));
        return value && (0, lodestar_utils_1.bytesToInt)(value, "be");
    }
}
exports.StateArchiveRepository = StateArchiveRepository;
//# sourceMappingURL=stateArchive.js.map