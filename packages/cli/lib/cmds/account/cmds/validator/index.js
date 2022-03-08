"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validator = void 0;
const options_1 = require("./options");
const create_1 = require("./create");
const deposit_1 = require("./deposit");
const import_1 = require("./import");
const list_1 = require("./list");
const slashingProtection_1 = require("./slashingProtection");
const voluntaryExit_1 = require("./voluntaryExit");
const recover_1 = require("./recover");
exports.validator = {
    command: "validator <command>",
    describe: "Provides commands for managing Eth2 validators.",
    options: options_1.accountValidatorOptions,
    subcommands: [create_1.create, deposit_1.deposit, import_1.importCmd, list_1.list, recover_1.recover, slashingProtection_1.slashingProtection, voluntaryExit_1.voluntaryExit],
};
//# sourceMappingURL=index.js.map