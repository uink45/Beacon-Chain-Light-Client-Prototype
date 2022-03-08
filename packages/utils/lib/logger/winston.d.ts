/**
 * @module logger
 */
/// <reference types="node" />
import { ILogger, ILoggerOptions } from "./interface";
import { Writable } from "node:stream";
import { TransportOpts } from "./transport";
import { LogData } from "./json";
export declare class WinstonLogger implements ILogger {
    private winston;
    private _level;
    private _options;
    private _transportOptsArr;
    constructor(options?: Partial<ILoggerOptions>, transportOptsArr?: TransportOpts[]);
    error(message: string, context?: LogData, error?: Error): void;
    warn(message: string, context?: LogData, error?: Error): void;
    info(message: string, context?: LogData, error?: Error): void;
    important(message: string, context?: LogData, error?: Error): void;
    verbose(message: string, context?: LogData, error?: Error): void;
    debug(message: string, context?: LogData, error?: Error): void;
    silly(message: string, context?: LogData, error?: Error): void;
    profile(message: string, option?: {
        level: string;
        message: string;
    }): void;
    stream(): Writable;
    child(options: ILoggerOptions): WinstonLogger;
    private createLogEntry;
}
//# sourceMappingURL=winston.d.ts.map