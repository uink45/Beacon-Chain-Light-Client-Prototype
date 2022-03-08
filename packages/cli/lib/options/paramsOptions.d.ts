import { IBeaconParamsUnparsed } from "../config/types";
import { ICliCommandOptions } from "../util";
export declare type ITerminalPowArgs = {
    "terminal-total-difficulty-override"?: string;
    "terminal-block-hash-override"?: string;
    "terminal-block-hash-epoch-override"?: string;
};
export declare type IParamsArgs = Record<never, never> & ITerminalPowArgs;
export declare function parseBeaconParamsArgs(args: Record<string, string | number>): IBeaconParamsUnparsed;
export declare function parseTerminalPowArgs(args: ITerminalPowArgs): IBeaconParamsUnparsed;
export declare const paramsOptions: ICliCommandOptions<IParamsArgs>;
//# sourceMappingURL=paramsOptions.d.ts.map