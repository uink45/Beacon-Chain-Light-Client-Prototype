"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wallet = void 0;
const options_1 = require("./options");
const create_1 = require("./create");
const list_1 = require("./list");
const recover_1 = require("./recover");
exports.wallet = {
    command: "wallet <command>",
    describe: "Provides commands for managing Eth2 wallets.",
    options: options_1.accountWalletsOptions,
    subcommands: [create_1.create, list_1.list, recover_1.recover],
};
//# sourceMappingURL=index.js.map