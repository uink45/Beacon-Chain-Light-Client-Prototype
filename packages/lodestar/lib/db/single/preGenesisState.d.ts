import { TreeBacked } from "@chainsafe/ssz";
import { allForks } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Db, IDbMetrics } from "@chainsafe/lodestar-db";
export declare class PreGenesisState {
    private readonly config;
    private readonly bucket;
    private readonly db;
    private readonly key;
    private readonly metrics?;
    constructor(config: IChainForkConfig, db: Db, metrics?: IDbMetrics);
    put(value: TreeBacked<allForks.BeaconState>): Promise<void>;
    get(): Promise<TreeBacked<allForks.BeaconState> | null>;
    delete(): Promise<void>;
    private type;
}
//# sourceMappingURL=preGenesisState.d.ts.map