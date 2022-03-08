"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const options_1 = require("../beacon/options");
const paths_1 = require("../beacon/paths");
const handler_1 = require("./handler");
const defaultBeaconPathsPrater = (0, paths_1.getBeaconPaths)({ rootDir: ".prater" });
exports.init = {
    command: "init",
    describe: "Initialize Lodestar directories and files necessary to run a beacon chain node. \
This step is not required, and should only be used to prepare special configurations",
    examples: [
        {
            command: "init --network prater",
            description: "Initialize a configuration for the Prater testnet. " +
                `Then, you can edit the config file ${defaultBeaconPathsPrater.configFile} to customize your beacon node settings`,
        },
    ],
    options: options_1.beaconOptions,
    handler: handler_1.initHandler,
};
//# sourceMappingURL=index.js.map