"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.parseArgs = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_1 = require("@chainsafe/lodestar");
const util_1 = require("../../util");
const getArgKey = (logModule) => `logger.${logModule}.level`;
function parseArgs(args) {
    return (0, util_1.ObjectKeys)(lodestar_1.defaultOptions.logger).reduce((options, logModule) => {
        const level = args[getArgKey(logModule)];
        if (level)
            options[logModule] = { level: lodestar_utils_1.LogLevel[level] };
        return options;
    }, {});
}
exports.parseArgs = parseArgs;
/**
 * Generates an option for each module in defaultOptions.logger
 * chain, db, eth1, etc
 */
exports.options = (0, util_1.ObjectKeys)(lodestar_1.defaultOptions.logger).reduce((options, logModule) => {
    var _a;
    return ({
        ...options,
        [getArgKey(logModule)]: {
            hidden: true,
            type: "string",
            choices: lodestar_utils_1.LogLevels,
            description: `Logging verbosity level for ${logModule}`,
            defaultDescription: ((_a = lodestar_1.defaultOptions.logger[logModule]) !== null && _a !== void 0 ? _a : {}).level,
            group: "log",
        },
    });
}, {});
//# sourceMappingURL=logger.js.map