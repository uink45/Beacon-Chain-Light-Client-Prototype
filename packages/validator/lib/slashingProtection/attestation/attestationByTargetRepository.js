"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttestationByTargetRepository = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const ssz_1 = require("@chainsafe/ssz");
const utils_1 = require("../utils");
/**
 * Manages validator db storage of attestations.
 * Entries in the db are indexed by an encoded key which combines the validator's public key and the
 * attestation's target epoch.
 */
class AttestationByTargetRepository {
    constructor(opts) {
        this.bucket = lodestar_db_1.Bucket.phase0_slashingProtectionAttestationByTarget;
        this.db = opts.controller;
        this.type = new ssz_1.ContainerType({
            fields: {
                sourceEpoch: lodestar_types_1.ssz.Epoch,
                targetEpoch: lodestar_types_1.ssz.Epoch,
                signingRoot: lodestar_types_1.ssz.Root,
            },
            // Custom type, not in the consensus specs
            casingMap: {
                sourceEpoch: "source_epoch",
                targetEpoch: "target_epoch",
                signingRoot: "signing_root",
            },
        });
    }
    async getAll(pubkey, limit) {
        const attestations = await this.db.values({
            limit,
            gte: this.encodeKey(pubkey, 0),
            lt: this.encodeKey(pubkey, Number.MAX_SAFE_INTEGER),
        });
        return attestations.map((attestation) => this.type.deserialize(attestation));
    }
    async get(pubkey, targetEpoch) {
        const att = await this.db.get(this.encodeKey(pubkey, targetEpoch));
        return att && this.type.deserialize(att);
    }
    async set(pubkey, atts) {
        await this.db.batchPut(atts.map((att) => ({
            key: this.encodeKey(pubkey, att.targetEpoch),
            value: Buffer.from(this.type.serialize(att)),
        })));
    }
    async listPubkeys() {
        const keys = await this.db.keys();
        return (0, utils_1.uniqueVectorArr)(keys.map((key) => this.decodeKey(key).pubkey));
    }
    encodeKey(pubkey, targetEpoch) {
        return (0, lodestar_db_1.encodeKey)(this.bucket, Buffer.concat([Buffer.from(pubkey), (0, lodestar_utils_1.intToBytes)(BigInt(targetEpoch), lodestar_db_1.uintLen, "be")]));
    }
    decodeKey(key) {
        return {
            pubkey: key.slice(lodestar_db_1.DB_PREFIX_LENGTH, lodestar_db_1.DB_PREFIX_LENGTH + utils_1.blsPubkeyLen),
            targetEpoch: (0, lodestar_utils_1.bytesToInt)(key.slice(lodestar_db_1.DB_PREFIX_LENGTH + utils_1.blsPubkeyLen, lodestar_db_1.DB_PREFIX_LENGTH + utils_1.blsPubkeyLen + lodestar_db_1.uintLen), "be"),
        };
    }
}
exports.AttestationByTargetRepository = AttestationByTargetRepository;
//# sourceMappingURL=attestationByTargetRepository.js.map