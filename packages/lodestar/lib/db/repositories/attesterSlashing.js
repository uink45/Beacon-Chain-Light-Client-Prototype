"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttesterSlashingRepository = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
/**
 * AttesterSlashing indexed by root
 *
 * Added via gossip or api
 * Removed when included on chain or old
 */
class AttesterSlashingRepository extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        super(config, db, lodestar_db_1.Bucket.phase0_attesterSlashing, lodestar_types_1.ssz.phase0.AttesterSlashing, metrics);
    }
    async hasAll(attesterIndices = []) {
        var _a;
        const attesterSlashings = (_a = (await this.values())) !== null && _a !== void 0 ? _a : [];
        const indices = new Set();
        for (const slashing of attesterSlashings) {
            for (const index of slashing.attestation1.attestingIndices)
                indices.add(index);
            for (const index of slashing.attestation2.attestingIndices)
                indices.add(index);
        }
        for (const attesterIndice of attesterIndices) {
            if (!indices.has(attesterIndice)) {
                return false;
            }
        }
        return true;
    }
}
exports.AttesterSlashingRepository = AttesterSlashingRepository;
//# sourceMappingURL=attesterSlashing.js.map