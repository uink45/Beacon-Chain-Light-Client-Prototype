"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slashingProtectionOptions = void 0;
const options_1 = require("../../../../validator/options");
exports.slashingProtectionOptions = {
    server: options_1.validatorOptions.server,
    force: {
        description: "If genesisValidatorsRoot can't be fetched from the Beacon node, use a zero hash",
        type: "boolean",
    },
};
//# sourceMappingURL=options.js.map