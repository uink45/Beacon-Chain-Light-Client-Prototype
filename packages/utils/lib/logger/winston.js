"use strict";
/**
 * @module logger
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinstonLogger = void 0;
const winston_1 = require("winston");
const interface_1 = require("./interface");
const chalk_1 = __importDefault(require("chalk"));
const format_1 = require("./format");
const transport_1 = require("./transport");
const defaultTransportOpts = { type: transport_1.TransportType.console };
class WinstonLogger {
    constructor(options = {}, transportOptsArr = [defaultTransportOpts]) {
        // `options.level` can override the level in the transport
        // This is necessary for child logger opts to take effect
        let minLevel = options === null || options === void 0 ? void 0 : options.level;
        for (const transportOpts of transportOptsArr) {
            transportOpts.level = getMinLevel(options === null || options === void 0 ? void 0 : options.level, transportOpts.level); // General level may override transport level
            minLevel = getMinLevel(minLevel, transportOpts.level); // Compute the minLevel from general and all transports
        }
        this.winston = (0, winston_1.createLogger)({
            level: (options === null || options === void 0 ? void 0 : options.level) || interface_1.defaultLogLevel,
            defaultMeta: { module: (options === null || options === void 0 ? void 0 : options.module) || "" },
            format: (0, format_1.getFormat)(options),
            transports: transportOptsArr.map((transportOpts) => (0, transport_1.fromTransportOpts)(transportOpts)),
            exitOnError: false,
        });
        this._level = minLevel || interface_1.defaultLogLevel;
        // Store for child logger
        this._options = options;
        this._transportOptsArr = transportOptsArr;
    }
    error(message, context, error) {
        this.createLogEntry(interface_1.LogLevel.error, message, context, error);
    }
    warn(message, context, error) {
        this.createLogEntry(interface_1.LogLevel.warn, message, context, error);
    }
    info(message, context, error) {
        this.createLogEntry(interface_1.LogLevel.info, message, context, error);
    }
    important(message, context, error) {
        this.createLogEntry(interface_1.LogLevel.info, chalk_1.default.red(message), context, error);
    }
    verbose(message, context, error) {
        this.createLogEntry(interface_1.LogLevel.verbose, message, context, error);
    }
    debug(message, context, error) {
        this.createLogEntry(interface_1.LogLevel.debug, message, context, error);
    }
    silly(message, context, error) {
        this.createLogEntry(interface_1.LogLevel.silly, message, context, error);
    }
    profile(message, option) {
        this.winston.profile(message, option);
    }
    stream() {
        throw Error("Not implemented");
    }
    child(options) {
        // Concat module tags
        if (options.module)
            options.module = [this._options.module, options.module].filter(Boolean).join(" ");
        return new WinstonLogger({ ...this._options, ...options }, this._transportOptsArr);
    }
    createLogEntry(level, message, context, error) {
        // don't propagate if silenced or message level is more detailed than logger level
        if (interface_1.logLevelNum[level] > interface_1.logLevelNum[this._level]) {
            return;
        }
        this.winston[level](message, { context, error });
    }
}
exports.WinstonLogger = WinstonLogger;
/** Return the min LogLevel from multiple transports */
function getMinLevel(...levelsArg) {
    const levels = levelsArg.filter((level) => Boolean(level));
    // Only if there are no levels to compute min from, consider defaultLogLevel
    if (levels.length === 0)
        return interface_1.defaultLogLevel;
    return levels.reduce(
    // error: 0, warn: 1, info: 2, ...
    (minLevel, level) => (interface_1.logLevelNum[level] > interface_1.logLevelNum[minLevel] ? level : minLevel));
}
//# sourceMappingURL=winston.js.map