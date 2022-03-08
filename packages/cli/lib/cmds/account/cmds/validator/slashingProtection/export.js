"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCmd = void 0;
const util_1 = require("../../../../../util");
const utils_1 = require("./utils");
exports.exportCmd = {
    command: "export",
    describe: "Export an interchange file.",
    examples: [
        {
            command: "account validator slashing-protection export --network prater --file interchange.json",
            description: "Export an interchange JSON file for all validators in the slashing protection DB",
        },
    ],
    options: {
        file: {
            description: "The slashing protection interchange file to export to (.json).",
            demandOption: true,
            type: "string",
        },
    },
    handler: async (args) => {
        const genesisValidatorsRoot = await (0, utils_1.getGenesisValidatorsRoot)(args);
        const slashingProtection = (0, utils_1.getSlashingProtection)(args);
        // TODO: Allow format version and pubkeys to be customized with CLI args
        const formatVersion = { version: "4", format: "complete" };
        const pubkeys = await slashingProtection.listPubkeys();
        const interchange = await slashingProtection.exportInterchange(genesisValidatorsRoot, pubkeys, formatVersion);
        (0, util_1.writeFile)(args.file, interchange);
        console.log("Export completed successfully");
    },
};
//# sourceMappingURL=export.js.map