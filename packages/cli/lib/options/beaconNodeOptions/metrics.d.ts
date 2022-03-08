import { IBeaconNodeOptions } from "@chainsafe/lodestar";
import { ICliCommandOptions } from "../../util";
export interface IMetricsArgs {
    "metrics.enabled": boolean;
    "metrics.gatewayUrl": string;
    "metrics.serverPort": number;
    "metrics.timeout": number;
    "metrics.listenAddr": string;
}
export declare function parseArgs(args: IMetricsArgs): IBeaconNodeOptions["metrics"];
export declare const options: ICliCommandOptions<IMetricsArgs>;
//# sourceMappingURL=metrics.d.ts.map