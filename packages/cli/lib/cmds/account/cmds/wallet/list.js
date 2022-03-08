"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
const wallet_1 = require("../../../../wallet");
const paths_1 = require("../../paths");
exports.list = {
    command: "list",
    describe: "Lists the names of all wallets",
    examples: [
        {
            command: "account wallet list --walletsDir .network/wallets",
            description: "List all wallets in .network/wallets",
        },
    ],
    handler: async (args) => {
        const accountPaths = (0, paths_1.getAccountPaths)(args);
        const walletManager = new wallet_1.WalletManager(accountPaths);
        const walletNames = walletManager.wallets().map(({ name }) => name);
        // eslint-disable-next-line no-console
        console.log(walletNames.join("\n"));
        // Return values for testing
        return walletNames;
    },
};
//# sourceMappingURL=list.js.map