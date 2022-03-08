import { IBeaconNodeOptions } from "@chainsafe/lodestar";
import { ICliCommandOptions } from "../../util";
export declare type ExecutionEngineArgs = {
    "execution.urls": string[];
    "execution.timeout": number;
    "jwt-secret"?: string;
};
export declare function parseArgs(args: ExecutionEngineArgs): IBeaconNodeOptions["executionEngine"];
export declare const options: ICliCommandOptions<ExecutionEngineArgs>;
//# sourceMappingURL=execution.d.ts.map