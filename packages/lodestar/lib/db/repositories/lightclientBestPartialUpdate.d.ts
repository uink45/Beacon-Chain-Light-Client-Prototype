import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { IDatabaseController, IDbMetrics, Repository } from "@chainsafe/lodestar-db";
import { SyncPeriod } from "@chainsafe/lodestar-types";
import { ContainerType } from "@chainsafe/ssz";
import { PartialLightClientUpdate, PartialLightClientUpdateFinalized, PartialLightClientUpdateNonFinalized } from "../../chain/lightClient/types";
/**
 * Best PartialLightClientUpdate in each SyncPeriod
 *
 * Used to prepare light client updates
 */
export declare class BestPartialLightClientUpdateRepository extends Repository<SyncPeriod, PartialLightClientUpdate> {
    typeFinalized: ContainerType<PartialLightClientUpdateFinalized>;
    typeNonFinalized: ContainerType<PartialLightClientUpdateNonFinalized>;
    constructor(config: IChainForkConfig, db: IDatabaseController<Uint8Array, Uint8Array>, metrics?: IDbMetrics);
    encodeValue(value: PartialLightClientUpdate): Uint8Array;
    decodeValue(data: Uint8Array): PartialLightClientUpdate;
}
//# sourceMappingURL=lightclientBestPartialUpdate.d.ts.map