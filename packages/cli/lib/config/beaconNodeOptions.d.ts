import { IBeaconNodeOptions } from "@chainsafe/lodestar";
import { RecursivePartial } from "@chainsafe/lodestar-utils";
import { NetworkName } from "../networks";
export declare class BeaconNodeOptions {
    private beaconNodeOptions;
    /**
     * Reads, parses and merges BeaconNodeOptions from (in order)
     * - Network options (diff)
     * - existing options file
     * - CLI flags
     */
    constructor({ network, configFile, bootnodesFile, beaconNodeOptionsCli, }: {
        network?: NetworkName;
        configFile?: string;
        bootnodesFile?: string;
        beaconNodeOptionsCli: RecursivePartial<IBeaconNodeOptions>;
    });
    /**
     * Returns current options
     */
    get(): RecursivePartial<IBeaconNodeOptions>;
    /**
     * Returns merged current options with defaultOptions
     */
    getWithDefaults(): IBeaconNodeOptions;
    set(beaconNodeOptionsPartial: RecursivePartial<IBeaconNodeOptions>): void;
    writeTo(filepath: string): void;
}
export declare function writeBeaconNodeOptions(filename: string, config: Partial<IBeaconNodeOptions>): void;
/**
 * This needs to be a synchronous function because it will be run as part of the yargs 'build' step
 * If the config file is not found, the default values will apply.
 */
export declare function readBeaconNodeOptions(filepath: string): RecursivePartial<IBeaconNodeOptions>;
/**
 * Typesafe wrapper to merge partial IBeaconNodeOptions objects
 */
export declare function mergeBeaconNodeOptions(...partialOptionsArr: RecursivePartial<IBeaconNodeOptions>[]): RecursivePartial<IBeaconNodeOptions>;
/**
 * Typesafe wrapper to merge IBeaconNodeOptions objects
 */
export declare function mergeBeaconNodeOptionsWithDefaults(defaultOptions: IBeaconNodeOptions, ...partialOptionsArr: RecursivePartial<IBeaconNodeOptions>[]): IBeaconNodeOptions;
//# sourceMappingURL=beaconNodeOptions.d.ts.map