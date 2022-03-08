"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeBeaconNodeOptionsWithDefaults = exports.mergeBeaconNodeOptions = exports.readBeaconNodeOptions = exports.writeBeaconNodeOptions = exports.BeaconNodeOptions = void 0;
const deepmerge_1 = __importDefault(require("deepmerge"));
const lodestar_1 = require("@chainsafe/lodestar");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const util_1 = require("../util");
const networks_1 = require("../networks");
class BeaconNodeOptions {
    /**
     * Reads, parses and merges BeaconNodeOptions from (in order)
     * - Network options (diff)
     * - existing options file
     * - CLI flags
     */
    constructor({ network, configFile, bootnodesFile, beaconNodeOptionsCli, }) {
        this.beaconNodeOptions = mergeBeaconNodeOptions(network ? (0, networks_1.getNetworkBeaconNodeOptions)(network) : {}, configFile ? readBeaconNodeOptions(configFile) : {}, bootnodesFile ? (0, networks_1.getInjectableBootEnrs)(bootnodesFile) : {}, beaconNodeOptionsCli);
    }
    /**
     * Returns current options
     */
    get() {
        return this.beaconNodeOptions;
    }
    /**
     * Returns merged current options with defaultOptions
     */
    getWithDefaults() {
        return mergeBeaconNodeOptionsWithDefaults(lodestar_1.defaultOptions, this.beaconNodeOptions);
    }
    set(beaconNodeOptionsPartial) {
        this.beaconNodeOptions = mergeBeaconNodeOptions(this.beaconNodeOptions, beaconNodeOptionsPartial);
    }
    writeTo(filepath) {
        (0, util_1.writeFile)(filepath, this.beaconNodeOptions);
    }
}
exports.BeaconNodeOptions = BeaconNodeOptions;
function writeBeaconNodeOptions(filename, config) {
    (0, util_1.writeFile)(filename, config);
}
exports.writeBeaconNodeOptions = writeBeaconNodeOptions;
/**
 * This needs to be a synchronous function because it will be run as part of the yargs 'build' step
 * If the config file is not found, the default values will apply.
 */
function readBeaconNodeOptions(filepath) {
    return (0, util_1.readFile)(filepath);
}
exports.readBeaconNodeOptions = readBeaconNodeOptions;
/**
 * Typesafe wrapper to merge partial IBeaconNodeOptions objects
 */
function mergeBeaconNodeOptions(...partialOptionsArr) {
    return partialOptionsArr.reduce((mergedBeaconOptions, options) => {
        // IBeaconNodeOptions contains instances so a deepmerge can only be done safely with `isMergeableObject: isPlainObject`
        return (0, deepmerge_1.default)(mergedBeaconOptions, options, {
            arrayMerge: overwriteTargetArrayIfItems,
            isMergeableObject: lodestar_utils_1.isPlainObject,
        });
    }, partialOptionsArr[0]);
}
exports.mergeBeaconNodeOptions = mergeBeaconNodeOptions;
/**
 * Typesafe wrapper to merge IBeaconNodeOptions objects
 */
function mergeBeaconNodeOptionsWithDefaults(defaultOptions, ...partialOptionsArr) {
    return mergeBeaconNodeOptions(defaultOptions, ...partialOptionsArr);
}
exports.mergeBeaconNodeOptionsWithDefaults = mergeBeaconNodeOptionsWithDefaults;
/**
 * If override array option (source) is defined and has items
 * replace target (original option).
 * Example: network.localMultiaddrs has default ['/ip4/127.0.0.1/tcp/30606'] and we don't wanna append to that with cli flag
 * as it could result in port taken
 * @param target
 * @param source
 */
function overwriteTargetArrayIfItems(target, source) {
    if (source.length === 0) {
        return target;
    }
    return source;
}
//# sourceMappingURL=beaconNodeOptions.js.map