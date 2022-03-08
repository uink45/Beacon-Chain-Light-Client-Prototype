import { Options } from "yargs";
import { IENRJson } from "../config";
export interface IENRArgs {
    "enr.ip"?: string;
    "enr.tcp"?: number;
    "enr.ip6"?: string;
    "enr.udp"?: number;
    "enr.tcp6"?: number;
    "enr.udp6"?: number;
}
export declare function parseEnrArgs(args: IENRArgs): IENRJson;
export declare const enrOptions: Record<string, Options>;
//# sourceMappingURL=enrOptions.d.ts.map