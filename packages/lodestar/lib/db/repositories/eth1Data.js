"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eth1DataRepository = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
class Eth1DataRepository extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        super(config, db, lodestar_db_1.Bucket.phase0_eth1Data, lodestar_types_1.ssz.phase0.Eth1DataOrdered, metrics);
    }
    decodeKey(data) {
        return (0, lodestar_utils_1.bytesToInt)(super.decodeKey(data), "be");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getId(value) {
        throw new Error("Unable to create timestamp from block hash");
    }
    async batchPutValues(eth1Datas) {
        await this.batchPut(eth1Datas.map((eth1Data) => ({
            key: eth1Data.timestamp,
            value: eth1Data,
        })));
    }
    async deleteOld(timestamp) {
        await this.batchDelete(await this.keys({ lt: timestamp }));
    }
}
exports.Eth1DataRepository = Eth1DataRepository;
//# sourceMappingURL=eth1Data.js.map