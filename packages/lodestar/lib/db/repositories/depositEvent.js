"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositEventRepository = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
/**
 * DepositData indexed by deposit index
 * Removed when included on chain or old
 */
class DepositEventRepository extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        super(config, db, lodestar_db_1.Bucket.phase0_depositEvent, lodestar_types_1.ssz.phase0.DepositEvent, metrics);
    }
    async deleteOld(depositCount) {
        const firstDepositIndex = await this.firstKey();
        if (firstDepositIndex === null) {
            return;
        }
        await this.batchDelete(Array.from({ length: depositCount - firstDepositIndex }, (_, i) => i + firstDepositIndex));
    }
    async batchPutValues(depositEvents) {
        await this.batchPut(depositEvents.map((depositEvent) => ({
            key: depositEvent.index,
            value: depositEvent,
        })));
    }
}
exports.DepositEventRepository = DepositEventRepository;
//# sourceMappingURL=depositEvent.js.map