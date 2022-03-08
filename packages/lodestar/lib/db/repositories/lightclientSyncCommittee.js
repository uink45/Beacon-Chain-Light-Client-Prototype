"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncCommitteeRepository = void 0;
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
/**
 * Historical sync committees by SyncCommittee hash tree root
 *
 * Used to prepare lightclient updates and initial snapshots
 */
class SyncCommitteeRepository extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        super(config, db, lodestar_db_1.Bucket.lightClient_syncCommittee, lodestar_types_1.ssz.altair.SyncCommittee, metrics);
    }
}
exports.SyncCommitteeRepository = SyncCommitteeRepository;
//# sourceMappingURL=lightclientSyncCommittee.js.map