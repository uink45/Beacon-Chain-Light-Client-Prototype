import { phase0, ValidatorIndex } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Db, Repository, IDbMetrics } from "@chainsafe/lodestar-db";
export declare class ProposerSlashingRepository extends Repository<ValidatorIndex, phase0.ProposerSlashing> {
    constructor(config: IChainForkConfig, db: Db, metrics?: IDbMetrics);
    getId(value: phase0.ProposerSlashing): ValidatorIndex;
}
//# sourceMappingURL=proposerSlashing.d.ts.map