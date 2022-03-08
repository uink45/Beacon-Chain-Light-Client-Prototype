"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eth1DataCache = void 0;
class Eth1DataCache {
    constructor(config, db) {
        this.config = config;
        this.db = db;
    }
    async get({ timestampRange }) {
        return await this.db.eth1Data.values(timestampRange);
    }
    async add(eth1Datas) {
        await this.db.eth1Data.batchPutValues(eth1Datas);
    }
    async getHighestCachedBlockNumber() {
        const highestEth1Data = await this.db.eth1Data.lastValue();
        return highestEth1Data && highestEth1Data.blockNumber;
    }
}
exports.Eth1DataCache = Eth1DataCache;
//# sourceMappingURL=eth1DataCache.js.map