"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paramsOptions = exports.parseTerminalPowArgs = exports.parseBeaconParamsArgs = void 0;
const lodestar_config_1 = require("@chainsafe/lodestar-config");
const util_1 = require("../util");
const getArgKey = (key) => `params.${key}`;
function parseBeaconParamsArgs(args) {
    return (0, util_1.ObjectKeys)(lodestar_config_1.chainConfigTypes).reduce((beaconParams, key) => {
        const value = args[getArgKey(key)];
        if (value != null)
            beaconParams[key] = value;
        return beaconParams;
    }, {});
}
exports.parseBeaconParamsArgs = parseBeaconParamsArgs;
const paramsOptionsByName = (0, util_1.ObjectKeys)(lodestar_config_1.chainConfigTypes).reduce((options, key) => ({
    ...options,
    [getArgKey(key)]: {
        hidden: true,
        type: "string",
        group: "params",
    },
}), {});
const terminalArgsToParamsMap = {
    "terminal-total-difficulty-override": "TERMINAL_TOTAL_DIFFICULTY",
    "terminal-block-hash-override": "TERMINAL_BLOCK_HASH",
    "terminal-block-hash-epoch-override": "TERMINAL_BLOCK_HASH_ACTIVATION_EPOCH",
};
function parseTerminalPowArgs(args) {
    const parsedArgs = (0, util_1.ObjectKeys)(terminalArgsToParamsMap).reduce((beaconParams, key) => {
        const paramOption = terminalArgsToParamsMap[key];
        const value = args[key];
        if (paramOption != null && value != null)
            beaconParams[paramOption] = value;
        return beaconParams;
    }, {});
    return parsedArgs;
}
exports.parseTerminalPowArgs = parseTerminalPowArgs;
exports.paramsOptions = {
    ...paramsOptionsByName,
    "terminal-total-difficulty-override": {
        description: "Terminal PoW block TTD override",
        type: "string",
    },
    "terminal-block-hash-override": {
        description: "Terminal PoW block hash override",
        type: "string",
    },
    "terminal-block-hash-epoch-override": {
        description: "Terminal PoW block hash override activation epoch",
        type: "string",
    },
};
//# sourceMappingURL=paramsOptions.js.map