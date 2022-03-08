import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { allForks } from "@chainsafe/lodestar-types";
import { Registry } from "prom-client";
import { IDbMetrics } from "@chainsafe/lodestar-db";
import { IBeaconMetrics } from "./metrics/beacon";
import { ILodestarMetrics } from "./metrics/lodestar";
import { IMetricsOptions } from "./options";
import { IValidatorMonitor } from "./validatorMonitor";
export declare type IMetrics = IBeaconMetrics & ILodestarMetrics & IValidatorMonitor & {
    register: Registry;
};
export declare function createMetrics(opts: IMetricsOptions, config: IChainForkConfig, anchorState: allForks.BeaconState, registries?: Registry[]): IMetrics;
export declare function createDbMetrics(): {
    metrics: IDbMetrics;
    registry: Registry;
};
//# sourceMappingURL=metrics.d.ts.map