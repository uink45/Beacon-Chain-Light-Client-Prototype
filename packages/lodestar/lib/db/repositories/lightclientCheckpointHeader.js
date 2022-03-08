"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckpointHeaderRepository = void 0;
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
/**
 * Block headers by block root. Until finality includes all headers seen by this node. After finality,
 * all non-checkpoint headers are pruned from this repository.
 *
 * Used to prepare light client updates
 */
class CheckpointHeaderRepository extends lodestar_db_1.Repository {
    constructor(config, db, metrics) {
        super(config, db, lodestar_db_1.Bucket.lightClient_checkpointHeader, lodestar_types_1.ssz.phase0.BeaconBlockHeader, metrics);
    }
}
exports.CheckpointHeaderRepository = CheckpointHeaderRepository;
//# sourceMappingURL=lightclientCheckpointHeader.js.map