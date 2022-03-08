"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockRepository = void 0;
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const multifork_1 = require("../../util/multifork");
/**
 * Blocks by root
 *
 * Used to store unfinalized blocks
 */
class BlockRepository extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        const type = lodestar_types_1.ssz.phase0.SignedBeaconBlock; // Pick some type but won't be used
        super(config, db, lodestar_db_1.Bucket.allForks_block, type, metrics);
    }
    /**
     * Id is hashTreeRoot of unsigned BeaconBlock
     */
    getId(value) {
        return this.config.getForkTypes(value.message.slot).BeaconBlock.hashTreeRoot(value.message);
    }
    encodeValue(value) {
        return this.config.getForkTypes(value.message.slot).SignedBeaconBlock.serialize(value);
    }
    decodeValue(data) {
        return (0, multifork_1.getSignedBlockTypeFromBytes)(this.config, data).deserialize(data);
    }
}
exports.BlockRepository = BlockRepository;
//# sourceMappingURL=block.js.map