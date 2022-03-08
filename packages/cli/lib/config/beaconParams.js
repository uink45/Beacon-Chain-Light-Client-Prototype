"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePartialIChainConfigJson = exports.getBeaconParams = exports.getBeaconConfig = exports.getBeaconParamsFromArgs = exports.getBeaconConfigFromArgs = void 0;
const lodestar_config_1 = require("@chainsafe/lodestar-config");
const util_1 = require("../util");
const networks_1 = require("../networks");
const global_1 = require("../paths/global");
const options_1 = require("../options");
/**
 * Convenience method to parse yargs CLI args and call getBeaconParams
 * @see getBeaconConfig
 */
function getBeaconConfigFromArgs(args) {
    return (0, lodestar_config_1.createIChainForkConfig)(getBeaconParamsFromArgs(args));
}
exports.getBeaconConfigFromArgs = getBeaconConfigFromArgs;
/**
 * Convenience method to parse yargs CLI args and call getBeaconParams
 * @see getBeaconParams
 */
function getBeaconParamsFromArgs(args) {
    return getBeaconParams({
        network: args.network,
        paramsFile: (0, global_1.getGlobalPaths)(args).paramsFile,
        additionalParamsCli: {
            ...(0, options_1.parseBeaconParamsArgs)(args),
            ...(0, options_1.parseTerminalPowArgs)(args),
        },
    });
}
exports.getBeaconParamsFromArgs = getBeaconParamsFromArgs;
/**
 * Initializes IBeaconConfig with params
 * @see getBeaconParams
 */
function getBeaconConfig(args) {
    return (0, lodestar_config_1.createIChainForkConfig)(getBeaconParams(args));
}
exports.getBeaconConfig = getBeaconConfig;
/**
 * Computes merged IBeaconParams type from (in order)
 * - Network params (diff)
 * - existing params file
 * - CLI flags
 */
function getBeaconParams({ network, paramsFile, additionalParamsCli }) {
    // Default network params
    const networkParams = network ? (0, networks_1.getNetworkBeaconParams)(network) : {};
    // Existing user custom params from file
    const fileParams = paramsFile
        ? parsePartialIChainConfigJson(readBeaconParams(paramsFile))
        : {};
    // Params from CLI flags
    const cliParams = parsePartialIChainConfigJson(additionalParamsCli);
    return (0, lodestar_config_1.createIChainConfig)({
        ...networkParams,
        ...fileParams,
        ...cliParams,
    });
}
exports.getBeaconParams = getBeaconParams;
function readBeaconParams(filepath) {
    var _a;
    return (_a = (0, util_1.readFile)(filepath)) !== null && _a !== void 0 ? _a : {};
}
function parsePartialIChainConfigJson(input) {
    return (0, lodestar_config_1.chainConfigFromJson)(input);
}
exports.parsePartialIChainConfigJson = parsePartialIChainConfigJson;
//# sourceMappingURL=beaconParams.js.map