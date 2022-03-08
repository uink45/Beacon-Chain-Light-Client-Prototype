"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackfilledRanges = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
/**
 * Slot to slot ranges that ensure that block range is fully backfilled
 *
 * If node starts backfilling at slots 1000, and backfills to 800, there will be an entry
 * 1000 -> 800
 *
 * When the node is backfilling if it starts at 1200 and backfills to 1000, it will find this sequence and,
 * jump directly to 800 and delete the key 1000.
 */
class BackfilledRanges extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        super(config, db, lodestar_db_1.Bucket.backfilled_ranges, lodestar_types_1.ssz.Slot, metrics);
    }
    decodeKey(data) {
        return (0, lodestar_utils_1.bytesToInt)(super.decodeKey(data), "be");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getId(value) {
        throw new Error("Cannot get the db key from slot");
    }
}
exports.BackfilledRanges = BackfilledRanges;
//# sourceMappingURL=backfilledRanges.js.map