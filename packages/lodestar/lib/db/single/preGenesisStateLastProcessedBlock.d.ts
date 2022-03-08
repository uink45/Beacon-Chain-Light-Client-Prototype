import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Db, IDbMetrics } from "@chainsafe/lodestar-db";
export declare class PreGenesisStateLastProcessedBlock {
    private readonly bucket;
    private readonly type;
    private readonly db;
    private readonly key;
    private readonly metrics?;
    constructor(config: IChainForkConfig, db: Db, metrics?: IDbMetrics);
    put(value: number): Promise<void>;
    get(): Promise<number | null>;
    delete(): Promise<void>;
}
//# sourceMappingURL=preGenesisStateLastProcessedBlock.d.ts.map