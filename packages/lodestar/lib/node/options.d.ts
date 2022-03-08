/**
 * @module node
 */
import { IApiOptions } from "../api/options";
import { IChainOptions } from "../chain/options";
import { IDatabaseOptions } from "../db/options";
import { Eth1Options } from "../eth1/options";
import { IBeaconLoggerOptions } from "./loggerOptions";
import { IMetricsOptions } from "../metrics/options";
import { INetworkOptions } from "../network/options";
import { SyncOptions } from "../sync/options";
import { ExecutionEngineOpts } from "../executionEngine";
export { allNamespaces } from "../api/rest/index";
export interface IBeaconNodeOptions {
    api: IApiOptions;
    chain: IChainOptions;
    db: IDatabaseOptions;
    eth1: Eth1Options;
    executionEngine: ExecutionEngineOpts;
    logger: IBeaconLoggerOptions;
    metrics: IMetricsOptions;
    network: INetworkOptions;
    sync: SyncOptions;
}
export declare const defaultOptions: IBeaconNodeOptions;
//# sourceMappingURL=options.d.ts.map