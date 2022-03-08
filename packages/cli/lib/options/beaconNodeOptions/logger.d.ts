import { IBeaconNodeOptions } from "@chainsafe/lodestar";
import { ICliCommandOptions } from "../../util";
export declare type ILoggerArgs = Record<string, unknown>;
export declare function parseArgs(args: ILoggerArgs): Partial<IBeaconNodeOptions["logger"]>;
/**
 * Generates an option for each module in defaultOptions.logger
 * chain, db, eth1, etc
 */
export declare const options: ICliCommandOptions<ILoggerArgs>;
//# sourceMappingURL=logger.d.ts.map