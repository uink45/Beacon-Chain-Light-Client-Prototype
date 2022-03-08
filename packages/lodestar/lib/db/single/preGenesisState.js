"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreGenesisState = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
class PreGenesisState {
    constructor(config, db, metrics) {
        this.config = config;
        this.db = db;
        this.bucket = lodestar_db_1.Bucket.phase0_preGenesisState;
        this.key = Buffer.from(new Uint8Array([this.bucket]));
        this.metrics = metrics;
    }
    async put(value) {
        var _a;
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.dbWrites.labels({ bucket: "phase0_preGenesisState" }).inc();
        await this.db.put(this.key, this.type().serialize(value));
    }
    async get() {
        var _a;
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.dbReads.labels({ bucket: "phase0_preGenesisState" }).inc();
        const value = await this.db.get(this.key);
        return value ? this.type().createTreeBackedFromBytes(value) : null;
    }
    async delete() {
        await this.db.delete(this.key);
    }
    type() {
        return this.config.getForkTypes(lodestar_params_1.GENESIS_SLOT).BeaconState;
    }
}
exports.PreGenesisState = PreGenesisState;
//# sourceMappingURL=preGenesisState.js.map