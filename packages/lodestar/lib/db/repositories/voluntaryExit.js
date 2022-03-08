"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoluntaryExitRepository = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
class VoluntaryExitRepository extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        super(config, db, lodestar_db_1.Bucket.phase0_exit, lodestar_types_1.ssz.phase0.SignedVoluntaryExit, metrics);
    }
    getId(value) {
        return value.message.validatorIndex;
    }
}
exports.VoluntaryExitRepository = VoluntaryExitRepository;
//# sourceMappingURL=voluntaryExit.js.map