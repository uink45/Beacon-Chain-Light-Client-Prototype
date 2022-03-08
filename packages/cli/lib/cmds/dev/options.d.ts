import { Options } from "yargs";
import { IBeaconArgs } from "../beacon/options";
interface IDevOwnArgs {
    genesisEth1Hash?: string;
    genesisValidators?: number;
    startValidators?: string;
    genesisTime?: number;
    reset?: boolean;
    server: string;
}
export declare const devOptions: {
    genesisEth1Hash: Options;
    genesisValidators: Options;
    startValidators: Options;
    genesisTime: Options;
    reset: Options;
    server: Options;
};
export declare type IDevArgs = IBeaconArgs & IDevOwnArgs;
export {};
//# sourceMappingURL=options.d.ts.map