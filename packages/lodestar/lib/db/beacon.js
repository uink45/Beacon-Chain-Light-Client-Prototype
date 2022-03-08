"use strict";
/**
 * @module db/api/beacon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeaconDb = void 0;
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const repositories_1 = require("./repositories");
const single_1 = require("./single");
class BeaconDb extends lodestar_db_1.DatabaseService {
    constructor(opts) {
        super(opts);
        this.metrics = opts.metrics;
        // Warning: If code is ever run in the constructor, must change this stub to not extend 'packages/lodestar/test/utils/stub/beaconDb.ts' -
        this.block = new repositories_1.BlockRepository(this.config, this.db, this.metrics);
        this.blockArchive = new repositories_1.BlockArchiveRepository(this.config, this.db, this.metrics);
        this.stateArchive = new repositories_1.StateArchiveRepository(this.config, this.db, this.metrics);
        this.voluntaryExit = new repositories_1.VoluntaryExitRepository(this.config, this.db, this.metrics);
        this.proposerSlashing = new repositories_1.ProposerSlashingRepository(this.config, this.db, this.metrics);
        this.attesterSlashing = new repositories_1.AttesterSlashingRepository(this.config, this.db, this.metrics);
        this.depositEvent = new repositories_1.DepositEventRepository(this.config, this.db, this.metrics);
        this.depositDataRoot = new repositories_1.DepositDataRootRepository(this.config, this.db, this.metrics);
        this.eth1Data = new repositories_1.Eth1DataRepository(this.config, this.db, this.metrics);
        this.preGenesisState = new single_1.PreGenesisState(this.config, this.db, this.metrics);
        this.preGenesisStateLastProcessedBlock = new single_1.PreGenesisStateLastProcessedBlock(this.config, this.db, this.metrics);
        // lightclient
        this.bestPartialLightClientUpdate = new repositories_1.BestPartialLightClientUpdateRepository(this.config, this.db, this.metrics);
        this.checkpointHeader = new repositories_1.CheckpointHeaderRepository(this.config, this.db, this.metrics);
        this.syncCommittee = new repositories_1.SyncCommitteeRepository(this.config, this.db, this.metrics);
        this.syncCommitteeWitness = new repositories_1.SyncCommitteeWitnessRepository(this.config, this.db, this.metrics);
        this.backfilledRanges = new repositories_1.BackfilledRanges(this.config, this.db, this.metrics);
    }
    async stop() {
        await super.stop();
    }
}
exports.BeaconDb = BeaconDb;
//# sourceMappingURL=beacon.js.map