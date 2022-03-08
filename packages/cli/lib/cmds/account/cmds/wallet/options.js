"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountWalletsOptions = void 0;
const paths_1 = require("../../paths");
exports.accountWalletsOptions = {
    walletsDir: {
        description: "Directory for storing wallets.",
        defaultDescription: paths_1.defaultAccountPaths.walletsDir,
        type: "string",
    },
};
//# sourceMappingURL=options.js.map