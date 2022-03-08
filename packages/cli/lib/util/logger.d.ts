import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { ILogger, LogLevel } from "@chainsafe/lodestar-utils";
export interface ILogArgs {
    logLevel?: LogLevel;
    logLevelFile?: LogLevel;
    logFormatGenesisTime?: number;
    logFormatId?: string;
    logRotate?: boolean;
    logMaxFiles?: number;
}
export declare function errorLogger(): ILogger;
/**
 * Setup a CLI logger, common for beacon, validator and dev commands
 */
export declare function getCliLogger(args: ILogArgs, paths: {
    logFile?: string;
}, config: IChainForkConfig): ILogger;
//# sourceMappingURL=logger.d.ts.map