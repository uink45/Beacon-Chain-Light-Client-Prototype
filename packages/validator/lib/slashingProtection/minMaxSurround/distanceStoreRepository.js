"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistanceStoreRepository = void 0;
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
/**
 * Manages validator db storage of min/max ranges for min/max surround vote slashing protection.
 */
class DistanceStoreRepository {
    constructor(opts) {
        this.minSpan = new SpanDistanceRepository(opts, lodestar_db_1.Bucket.index_slashingProtectionMinSpanDistance);
        this.maxSpan = new SpanDistanceRepository(opts, lodestar_db_1.Bucket.index_slashingProtectionMaxSpanDistance);
    }
}
exports.DistanceStoreRepository = DistanceStoreRepository;
class SpanDistanceRepository {
    constructor(opts, bucket) {
        this.db = opts.controller;
        this.type = lodestar_types_1.ssz.Epoch;
        this.bucket = bucket;
    }
    async get(pubkey, epoch) {
        const distance = await this.db.get(this.encodeKey(pubkey, epoch));
        return distance && this.type.deserialize(distance);
    }
    async setBatch(pubkey, values) {
        await this.db.batchPut(values.map((value) => ({
            key: this.encodeKey(pubkey, value.source),
            value: Buffer.from(this.type.serialize(value.distance)),
        })));
    }
    encodeKey(pubkey, epoch) {
        return (0, lodestar_db_1.encodeKey)(this.bucket, Buffer.concat([Buffer.from(pubkey), (0, lodestar_utils_1.intToBytes)(BigInt(epoch), 8, "be")]));
    }
}
//# sourceMappingURL=distanceStoreRepository.js.map