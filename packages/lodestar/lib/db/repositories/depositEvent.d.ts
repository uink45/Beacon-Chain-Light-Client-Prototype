import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { phase0 } from "@chainsafe/lodestar-types";
import { Db, Repository, IDbMetrics } from "@chainsafe/lodestar-db";
/**
 * DepositData indexed by deposit index
 * Removed when included on chain or old
 */
export declare class DepositEventRepository extends Repository<number, phase0.DepositEvent> {
    constructor(config: IChainForkConfig, db: Db, metrics?: IDbMetrics);
    deleteOld(depositCount: number): Promise<void>;
    batchPutValues(depositEvents: phase0.DepositEvent[]): Promise<void>;
}
//# sourceMappingURL=depositEvent.d.ts.map