"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
const validatorDir_1 = require("../../../../validatorDir");
const paths_1 = require("../../paths");
const format_1 = require("../../../../util/format");
exports.list = {
    command: "list",
    describe: "Lists the public keys of all validators",
    examples: [
        {
            command: "account validator list --keystoresDir .testing/keystores",
            description: "List all validator pubkeys in the directory .testing/keystores",
        },
    ],
    handler: async (args) => {
        const accountPaths = (0, paths_1.getAccountPaths)(args);
        const validatorDirManager = new validatorDir_1.ValidatorDirManager(accountPaths);
        const validatorPubKeys = validatorDirManager.iterDir();
        // eslint-disable-next-line no-console
        console.log(validatorPubKeys.map(format_1.add0xPrefix).join("\n"));
        // Return values for testing
        return validatorPubKeys;
    },
};
//# sourceMappingURL=list.js.map