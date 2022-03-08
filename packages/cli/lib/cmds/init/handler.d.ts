import { BeaconNodeOptions } from "../../config";
import { IGlobalArgs } from "../../options";
import { IBeaconArgs } from "../beacon/options";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
export declare type ReturnType = {
    beaconNodeOptions: BeaconNodeOptions;
    config: IChainForkConfig;
};
/**
 * Initialize lodestar-cli with an on-disk configuration
 */
export declare function initHandler(args: IBeaconArgs & IGlobalArgs): Promise<ReturnType>;
export declare function initializeOptionsAndConfig(args: IBeaconArgs & IGlobalArgs): Promise<ReturnType>;
/**
 * Write options and configs to disk
 */
export declare function persistOptionsAndConfig(args: IBeaconArgs & IGlobalArgs): Promise<void>;
//# sourceMappingURL=handler.d.ts.map