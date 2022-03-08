"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importCmd = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const utils_1 = require("./utils");
exports.importCmd = {
    command: "import",
    describe: "Import an interchange file.",
    examples: [
        {
            command: "account validator slashing-protection import --network prater --file interchange.json",
            description: "Import an interchange file to the slashing protection DB",
        },
    ],
    options: {
        file: {
            description: "The slashing protection interchange file to import (.json).",
            demandOption: true,
            type: "string",
        },
    },
    handler: async (args) => {
        const genesisValidatorsRoot = await (0, utils_1.getGenesisValidatorsRoot)(args);
        const slashingProtection = (0, utils_1.getSlashingProtection)(args);
        const importFile = await node_fs_1.default.promises.readFile(args.file, "utf8");
        const importFileJson = JSON.parse(importFile);
        await slashingProtection.importInterchange(importFileJson, genesisValidatorsRoot);
        console.log("Import completed successfully");
    },
};
//# sourceMappingURL=import.js.map