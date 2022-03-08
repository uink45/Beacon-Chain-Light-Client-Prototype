/// <reference types="yargs" />
import { IParamsArgs } from "./paramsOptions";
import { NetworkName } from "../networks";
interface IGlobalSingleArgs {
    rootDir: string;
    network: NetworkName;
    paramsFile: string;
    preset: string;
}
export declare const defaultNetwork: NetworkName;
export declare const rcConfigOption: [string, string, (configPath: string) => Record<string, unknown>];
export declare type IGlobalArgs = IGlobalSingleArgs & IParamsArgs;
export declare const globalOptions: {
    "terminal-total-difficulty-override": import("yargs").Options;
    "terminal-block-hash-override": import("yargs").Options;
    "terminal-block-hash-epoch-override": import("yargs").Options;
    rootDir: import("yargs").Options;
    network: import("yargs").Options;
    paramsFile: import("yargs").Options;
    preset: import("yargs").Options;
};
export {};
//# sourceMappingURL=globalOptions.d.ts.map