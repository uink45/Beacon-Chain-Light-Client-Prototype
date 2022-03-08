"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slashingProtection = void 0;
const options_1 = require("./options");
const import_1 = require("./import");
const export_1 = require("./export");
exports.slashingProtection = {
    command: "slashing-protection <command>",
    describe: "Import or export slashing protection data to or from another client.",
    options: options_1.slashingProtectionOptions,
    subcommands: [import_1.importCmd, export_1.exportCmd],
};
//# sourceMappingURL=index.js.map