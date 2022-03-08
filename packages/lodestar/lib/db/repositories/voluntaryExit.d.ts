import { phase0, ValidatorIndex } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Db, Repository, IDbMetrics } from "@chainsafe/lodestar-db";
export declare class VoluntaryExitRepository extends Repository<ValidatorIndex, phase0.SignedVoluntaryExit> {
    constructor(config: IChainForkConfig, db: Db, metrics?: IDbMetrics);
    getId(value: phase0.SignedVoluntaryExit): ValidatorIndex;
}
//# sourceMappingURL=voluntaryExit.d.ts.map