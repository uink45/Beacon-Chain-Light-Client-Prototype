/**
 * @module db/api/beacon
 */
import { DatabaseService, IDatabaseApiOptions, IDbMetrics } from "@chainsafe/lodestar-db";
import { IBeaconDb } from "./interface";
import { AttesterSlashingRepository, BlockArchiveRepository, BlockRepository, DepositEventRepository, DepositDataRootRepository, Eth1DataRepository, ProposerSlashingRepository, StateArchiveRepository, VoluntaryExitRepository, BestPartialLightClientUpdateRepository, CheckpointHeaderRepository, SyncCommitteeRepository, SyncCommitteeWitnessRepository, BackfilledRanges } from "./repositories";
import { PreGenesisState, PreGenesisStateLastProcessedBlock } from "./single";
export declare class BeaconDb extends DatabaseService implements IBeaconDb {
    metrics?: IDbMetrics;
    block: BlockRepository;
    blockArchive: BlockArchiveRepository;
    stateArchive: StateArchiveRepository;
    voluntaryExit: VoluntaryExitRepository;
    proposerSlashing: ProposerSlashingRepository;
    attesterSlashing: AttesterSlashingRepository;
    depositEvent: DepositEventRepository;
    depositDataRoot: DepositDataRootRepository;
    eth1Data: Eth1DataRepository;
    preGenesisState: PreGenesisState;
    preGenesisStateLastProcessedBlock: PreGenesisStateLastProcessedBlock;
    bestPartialLightClientUpdate: BestPartialLightClientUpdateRepository;
    checkpointHeader: CheckpointHeaderRepository;
    syncCommittee: SyncCommitteeRepository;
    syncCommitteeWitness: SyncCommitteeWitnessRepository;
    backfilledRanges: BackfilledRanges;
    constructor(opts: IDatabaseApiOptions);
    stop(): Promise<void>;
}
//# sourceMappingURL=beacon.d.ts.map