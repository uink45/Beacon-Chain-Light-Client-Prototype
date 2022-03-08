import { ILogger } from "@chainsafe/lodestar-utils";
import { IClock } from "./clock";
export declare type ILoggerVc = Pick<ILogger, "error" | "warn" | "info" | "verbose" | "debug"> & {
    isSyncing(e: Error): void;
};
export declare function getLoggerVc(logger: ILogger, clock: IClock): ILoggerVc;
//# sourceMappingURL=logger.d.ts.map