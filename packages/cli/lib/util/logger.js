"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCliLogger = exports.errorLogger = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
function errorLogger() {
    return new lodestar_utils_1.WinstonLogger({ level: lodestar_utils_1.LogLevel.error });
}
exports.errorLogger = errorLogger;
/**
 * Setup a CLI logger, common for beacon, validator and dev commands
 */
function getCliLogger(args, paths, config) {
    const transports = [{ type: lodestar_utils_1.TransportType.console }];
    if (paths.logFile) {
        transports.push({
            type: lodestar_utils_1.TransportType.file,
            filename: paths.logFile,
            level: args.logLevelFile,
            rotate: args.logRotate,
            maxfiles: args.logMaxFiles,
        });
    }
    const timestampFormat = args.logFormatGenesisTime !== undefined
        ? {
            format: lodestar_utils_1.TimestampFormatCode.EpochSlot,
            genesisTime: args.logFormatGenesisTime,
            secondsPerSlot: config.SECONDS_PER_SLOT,
            slotsPerEpoch: lodestar_params_1.SLOTS_PER_EPOCH,
        }
        : {
            format: lodestar_utils_1.TimestampFormatCode.DateRegular,
        };
    return new lodestar_utils_1.WinstonLogger({ level: args.logLevel, module: args.logFormatId, timestampFormat }, transports);
}
exports.getCliLogger = getCliLogger;
//# sourceMappingURL=logger.js.map