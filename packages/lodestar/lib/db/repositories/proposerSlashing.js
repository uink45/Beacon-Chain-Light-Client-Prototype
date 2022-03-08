"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposerSlashingRepository = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
class ProposerSlashingRepository extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        super(config, db, lodestar_db_1.Bucket.phase0_proposerSlashing, lodestar_types_1.ssz.phase0.ProposerSlashing, metrics);
    }
    getId(value) {
        return value.signedHeader1.message.proposerIndex;
    }
}
exports.ProposerSlashingRepository = ProposerSlashingRepository;
//# sourceMappingURL=proposerSlashing.js.map