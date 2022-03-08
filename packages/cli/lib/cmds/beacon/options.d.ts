import { Options } from "yargs";
import { IBeaconNodeArgs, IENRArgs, IWSSArgs } from "../../options";
import { IBeaconPaths } from "./paths";
import { ICliCommandOptions, ILogArgs } from "../../util";
interface IBeaconExtraArgs {
    port?: number;
    discoveryPort?: number;
    forceGenesis?: boolean;
    genesisStateFile?: string;
}
export declare const beaconExtraOptions: ICliCommandOptions<IBeaconExtraArgs>;
export declare const logOptions: ICliCommandOptions<ILogArgs>;
export declare const beaconPathsOptions: ICliCommandOptions<IBeaconPaths>;
export declare type IBeaconArgs = IBeaconExtraArgs & ILogArgs & IBeaconPaths & IBeaconNodeArgs & IENRArgs & IWSSArgs;
export declare const beaconOptions: {
    [k: string]: Options;
};
export {};
//# sourceMappingURL=options.d.ts.map