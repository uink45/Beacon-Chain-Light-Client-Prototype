"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalOptions = exports.rcConfigOption = exports.defaultNetwork = void 0;
const paramsOptions_1 = require("./paramsOptions");
const networks_1 = require("../networks");
const util_1 = require("../util");
exports.defaultNetwork = "mainnet";
const globalSingleOptions = {
    rootDir: {
        description: "Lodestar root directory",
        type: "string",
    },
    network: {
        description: "Name of the Eth2 chain network to join",
        type: "string",
        default: exports.defaultNetwork,
        choices: networks_1.networkNames,
    },
    paramsFile: {
        description: "Network configuration file",
        type: "string",
    },
    // hidden option to allow for LODESTAR_PRESET to be set
    preset: {
        hidden: true,
        type: "string",
    },
};
exports.rcConfigOption = [
    "rcConfig",
    "RC file to supplement command line args, accepted formats: .yml, .yaml, .json",
    (configPath) => (0, util_1.readFile)(configPath, ["json", "yml", "yaml"]),
];
exports.globalOptions = {
    ...globalSingleOptions,
    ...paramsOptions_1.paramsOptions,
};
//# sourceMappingURL=globalOptions.js.map