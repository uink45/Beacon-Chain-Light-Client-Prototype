import { IChainConfig, IChainForkConfig } from "@chainsafe/lodestar-config";
import { NetworkName } from "../networks";
import { IGlobalPaths } from "../paths/global";
import { IBeaconParamsUnparsed } from "./types";
declare type IBeaconParamsCliArgs = {
    network?: NetworkName;
    paramsFile: string;
} & Partial<IGlobalPaths>;
interface IBeaconParamsArgs {
    network?: NetworkName;
    paramsFile?: string;
    additionalParamsCli: IBeaconParamsUnparsed;
}
/**
 * Convenience method to parse yargs CLI args and call getBeaconParams
 * @see getBeaconConfig
 */
export declare function getBeaconConfigFromArgs(args: IBeaconParamsCliArgs): IChainForkConfig;
/**
 * Convenience method to parse yargs CLI args and call getBeaconParams
 * @see getBeaconParams
 */
export declare function getBeaconParamsFromArgs(args: IBeaconParamsCliArgs): IChainConfig;
/**
 * Initializes IBeaconConfig with params
 * @see getBeaconParams
 */
export declare function getBeaconConfig(args: IBeaconParamsArgs): IChainForkConfig;
/**
 * Computes merged IBeaconParams type from (in order)
 * - Network params (diff)
 * - existing params file
 * - CLI flags
 */
export declare function getBeaconParams({ network, paramsFile, additionalParamsCli }: IBeaconParamsArgs): IChainConfig;
export declare function parsePartialIChainConfigJson(input: Record<string, unknown>): Partial<IChainConfig>;
export {};
//# sourceMappingURL=beaconParams.d.ts.map