import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Db } from "./controller";
import { IDbMetrics } from "./metrics";
export interface IDatabaseApiOptions {
    config: IChainForkConfig;
    controller: Db;
    metrics?: IDbMetrics;
}
export declare abstract class DatabaseService {
    protected config: IChainForkConfig;
    protected db: Db;
    protected constructor(opts: IDatabaseApiOptions);
    start(): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=databaseService.d.ts.map