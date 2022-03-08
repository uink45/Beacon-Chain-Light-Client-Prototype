import { ILoggerOptions } from "@chainsafe/lodestar-utils";
export interface IBeaconLoggerOptions {
    chain: ILoggerOptions;
    db: ILoggerOptions;
    eth1: ILoggerOptions;
    node: ILoggerOptions;
    network: ILoggerOptions;
    sync: ILoggerOptions;
    backfill: ILoggerOptions;
    api: ILoggerOptions;
    metrics: ILoggerOptions;
}
export interface IValidatorLoggerOptions {
    validator: ILoggerOptions;
}
export declare const defaultLoggerOptions: IBeaconLoggerOptions;
//# sourceMappingURL=loggerOptions.d.ts.map