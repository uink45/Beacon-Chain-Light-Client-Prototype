import { IBeaconNodeOptions } from "@chainsafe/lodestar";
import { ICliCommandOptions } from "../../util";
export interface IApiArgs {
    "api.maxGindicesInProof": number;
    "api.rest.api": string[];
    "api.rest.cors": string;
    "api.rest.enabled": boolean;
    "api.rest.host": string;
    "api.rest.port": number;
}
export declare function parseArgs(args: IApiArgs): IBeaconNodeOptions["api"];
export declare const options: ICliCommandOptions<IApiArgs>;
//# sourceMappingURL=api.d.ts.map