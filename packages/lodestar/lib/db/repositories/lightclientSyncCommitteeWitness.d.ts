import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { IDatabaseController, IDbMetrics, Repository } from "@chainsafe/lodestar-db";
import { SyncCommitteeWitness } from "../../chain/lightClient/types";
/**
 * Historical sync committees witness by block root
 *
 * Used to prepare lightclient updates and initial snapshots
 */
export declare class SyncCommitteeWitnessRepository extends Repository<Uint8Array, SyncCommitteeWitness> {
    constructor(config: IChainForkConfig, db: IDatabaseController<Uint8Array, Uint8Array>, metrics?: IDbMetrics);
}
//# sourceMappingURL=lightclientSyncCommitteeWitness.d.ts.map