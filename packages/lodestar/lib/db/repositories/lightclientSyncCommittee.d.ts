import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { IDatabaseController, IDbMetrics, Repository } from "@chainsafe/lodestar-db";
import { altair } from "@chainsafe/lodestar-types";
/**
 * Historical sync committees by SyncCommittee hash tree root
 *
 * Used to prepare lightclient updates and initial snapshots
 */
export declare class SyncCommitteeRepository extends Repository<Uint8Array, altair.SyncCommittee> {
    constructor(config: IChainForkConfig, db: IDatabaseController<Uint8Array, Uint8Array>, metrics?: IDbMetrics);
}
//# sourceMappingURL=lightclientSyncCommittee.d.ts.map