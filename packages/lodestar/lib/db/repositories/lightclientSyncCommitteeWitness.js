"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncCommitteeWitnessRepository = void 0;
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
/**
 * Historical sync committees witness by block root
 *
 * Used to prepare lightclient updates and initial snapshots
 */
class SyncCommitteeWitnessRepository extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        const type = new ssz_1.ContainerType({
            fields: {
                witness: new ssz_1.VectorType({ length: 4, elementType: lodestar_types_1.ssz.Root }),
                currentSyncCommitteeRoot: lodestar_types_1.ssz.Root,
                nextSyncCommitteeRoot: lodestar_types_1.ssz.Root,
            },
        });
        super(config, db, lodestar_db_1.Bucket.lightClient_syncCommitteeWitness, type, metrics);
    }
}
exports.SyncCommitteeWitnessRepository = SyncCommitteeWitnessRepository;
//# sourceMappingURL=lightclientSyncCommitteeWitness.js.map