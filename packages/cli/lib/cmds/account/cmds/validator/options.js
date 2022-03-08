"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountValidatorOptions = void 0;
const paths_1 = require("../../paths");
exports.accountValidatorOptions = {
    keystoresDir: {
        description: "Directory for storing validator keystores.",
        defaultDescription: paths_1.defaultAccountPaths.keystoresDir,
        type: "string",
    },
    secretsDir: {
        description: "Directory for storing validator keystore secrets.",
        defaultDescription: paths_1.defaultAccountPaths.secretsDir,
        type: "string",
    },
};
//# sourceMappingURL=options.js.map