import { phase0, ValidatorIndex } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Db, Repository, IDbMetrics } from "@chainsafe/lodestar-db";
/**
 * AttesterSlashing indexed by root
 *
 * Added via gossip or api
 * Removed when included on chain or old
 */
export declare class AttesterSlashingRepository extends Repository<Uint8Array, phase0.AttesterSlashing> {
    constructor(config: IChainForkConfig, db: Db, metrics?: IDbMetrics);
    hasAll(attesterIndices?: ValidatorIndex[]): Promise<boolean>;
}
//# sourceMappingURL=attesterSlashing.d.ts.map