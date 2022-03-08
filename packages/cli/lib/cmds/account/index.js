"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.account = void 0;
const validator_1 = require("./cmds/validator");
const wallet_1 = require("./cmds/wallet");
exports.account = {
    command: "account <command>",
    describe: "Utilities for generating and managing Ethereum 2.0 accounts",
    subcommands: [validator_1.validator, wallet_1.wallet],
};
//# sourceMappingURL=index.js.map