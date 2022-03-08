"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validator = void 0;
const paths_1 = require("../account/paths");
const options_1 = require("./options");
const handler_1 = require("./handler");
exports.validator = {
    command: "validator",
    describe: "Run one or multiple validator clients",
    examples: [
        {
            command: "validator --network prater",
            description: "Run one validator client with all the keystores available in the directory" +
                ` ${(0, paths_1.getAccountPaths)({ rootDir: ".prater" }).keystoresDir}`,
        },
    ],
    options: options_1.validatorOptions,
    handler: handler_1.validatorHandler,
};
//# sourceMappingURL=index.js.map