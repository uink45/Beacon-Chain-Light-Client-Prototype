"use strict";
/**
 * @module logger
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimestampFormatCode = exports.logFormats = exports.defaultLogLevel = exports.customColors = exports.LogLevels = exports.logLevelNum = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["error"] = "error";
    LogLevel["warn"] = "warn";
    LogLevel["info"] = "info";
    LogLevel["verbose"] = "verbose";
    LogLevel["debug"] = "debug";
    LogLevel["silly"] = "silly";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
exports.logLevelNum = {
    [LogLevel.error]: 0,
    [LogLevel.warn]: 1,
    [LogLevel.info]: 2,
    [LogLevel.verbose]: 3,
    [LogLevel.debug]: 4,
    [LogLevel.silly]: 5,
};
// eslint-disable-next-line @typescript-eslint/naming-convention
exports.LogLevels = Object.values(LogLevel);
exports.customColors = {
    error: "red",
    warn: "yellow",
    info: "white",
    verbose: "green",
    debug: "pink",
    silly: "purple",
};
exports.defaultLogLevel = LogLevel.info;
exports.logFormats = ["human", "json"];
var TimestampFormatCode;
(function (TimestampFormatCode) {
    TimestampFormatCode[TimestampFormatCode["DateRegular"] = 0] = "DateRegular";
    TimestampFormatCode[TimestampFormatCode["EpochSlot"] = 1] = "EpochSlot";
})(TimestampFormatCode = exports.TimestampFormatCode || (exports.TimestampFormatCode = {}));
//# sourceMappingURL=interface.js.map