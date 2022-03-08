export declare type LogHandler = (message: string, context?: any, error?: Error) => void;
export declare type ILcLogger = {
    error: LogHandler;
    warn: LogHandler;
    info: LogHandler;
    debug: LogHandler;
};
/**
 * With `console` module and ignoring debug logs
 */
export declare function getLcLoggerConsole(opts?: {
    logDebug?: boolean;
}): ILcLogger;
//# sourceMappingURL=logger.d.ts.map