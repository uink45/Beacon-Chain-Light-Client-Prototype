"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttestationLowerBoundRepository = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const ssz_1 = require("@chainsafe/ssz");
/**
 * Manages validator db storage of the minimum source and target epochs required of a validator
 * attestation.
 */
class AttestationLowerBoundRepository {
    constructor(opts) {
        this.bucket = lodestar_db_1.Bucket.phase0_slashingProtectionAttestationLowerBound;
        this.db = opts.controller;
        this.type = new ssz_1.ContainerType({
            fields: {
                minSourceEpoch: lodestar_types_1.ssz.Epoch,
                minTargetEpoch: lodestar_types_1.ssz.Epoch,
            },
            // Custom type, not in the consensus specs
            casingMap: {
                minSourceEpoch: "min_source_epoch",
                minTargetEpoch: "min_target_epoch",
            },
        });
    }
    async get(pubkey) {
        const att = await this.db.get(this.encodeKey(pubkey));
        return att && this.type.deserialize(att);
    }
    async set(pubkey, value) {
        await this.db.put(this.encodeKey(pubkey), Buffer.from(this.type.serialize(value)));
    }
    encodeKey(pubkey) {
        return (0, lodestar_db_1.encodeKey)(this.bucket, Buffer.from(pubkey));
    }
}
exports.AttestationLowerBoundRepository = AttestationLowerBoundRepository;
//# sourceMappingURL=attestationLowerBoundRepository.js.map