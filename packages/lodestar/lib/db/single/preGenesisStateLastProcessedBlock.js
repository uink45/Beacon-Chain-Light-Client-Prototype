"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreGenesisStateLastProcessedBlock = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
class PreGenesisStateLastProcessedBlock {
    constructor(config, db, metrics) {
        this.db = db;
        this.type = lodestar_types_1.ssz.Number64;
        this.bucket = lodestar_db_1.Bucket.phase0_preGenesisStateLastProcessedBlock;
        this.key = Buffer.from(new Uint8Array([this.bucket]));
        this.metrics = metrics;
    }
    async put(value) {
        var _a;
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.dbWrites.labels({ bucket: "phase0_preGenesisStateLastProcessedBlock" }).inc();
        await this.db.put(this.key, this.type.serialize(value));
    }
    async get() {
        var _a;
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.dbReads.labels({ bucket: "phase0_preGenesisStateLastProcessedBlock" }).inc();
        const value = await this.db.get(this.key);
        return value ? this.type.deserialize(value) : null;
    }
    async delete() {
        await this.db.delete(this.key);
    }
}
exports.PreGenesisStateLastProcessedBlock = PreGenesisStateLastProcessedBlock;
//# sourceMappingURL=preGenesisStateLastProcessedBlock.js.map