"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dev = void 0;
const options_1 = require("./options");
const handler_1 = require("./handler");
exports.dev = {
    command: "dev",
    describe: "Quickly bootstrap a beacon node and multiple validators. Use for development and testing",
    examples: [
        {
            command: "dev --genesisValidators 8 --reset",
            description: "Start a single beacon node with 8 interop validators",
        },
    ],
    options: options_1.devOptions,
    handler: handler_1.devHandler,
};
//# sourceMappingURL=index.js.map