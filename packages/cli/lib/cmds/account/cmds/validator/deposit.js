"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deposit = void 0;
const util_1 = require("../../../../util");
const deprecatedDescription = "DEPRECATED. Please use the official tools to perform your deposits \
- eth2.0-deposit-cli: https://github.com/ethereum/eth2.0-deposit-cli \
- Ethereum Foundation launchpad: https://prater.launchpad.ethereum.org";
exports.deposit = {
    command: "deposit",
    describe: deprecatedDescription,
    examples: [],
    options: {},
    handler: async () => {
        throw new util_1.YargsError(deprecatedDescription);
    },
};
//# sourceMappingURL=deposit.js.map