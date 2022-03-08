"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaDataRepository = void 0;
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const GENESIS_VALIDATORS_ROOT = Buffer.from("GENESIS_VALIDATORS_ROOT");
const GENESIS_TIME = Buffer.from("GENESIS_TIME");
/**
 * Store MetaData of validator.
 */
class MetaDataRepository {
    constructor(opts) {
        this.bucket = lodestar_db_1.Bucket.validator_metaData;
        this.db = opts.controller;
    }
    async getGenesisValidatorsRoot() {
        return this.db.get(this.encodeKey(GENESIS_VALIDATORS_ROOT));
    }
    async setGenesisValidatorsRoot(genesisValidatorsRoot) {
        await this.db.put(this.encodeKey(GENESIS_VALIDATORS_ROOT), Buffer.from(genesisValidatorsRoot.valueOf()));
    }
    async getGenesisTime() {
        const bytes = await this.db.get(this.encodeKey(GENESIS_TIME));
        return bytes ? lodestar_types_1.ssz.Uint64.deserialize(bytes) : null;
    }
    async setGenesisTime(genesisTime) {
        await this.db.put(this.encodeKey(GENESIS_TIME), Buffer.from(lodestar_types_1.ssz.Uint64.serialize(genesisTime)));
    }
    encodeKey(key) {
        return (0, lodestar_db_1.encodeKey)(this.bucket, key);
    }
}
exports.MetaDataRepository = MetaDataRepository;
//# sourceMappingURL=metaDataRepository.js.map