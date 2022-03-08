"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultChainOptions = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
exports.defaultChainOptions = {
    blsVerifyAllMainThread: false,
    blsVerifyAllMultiThread: false,
    disableBlsBatchVerify: false,
    persistInvalidSszObjects: true,
    persistInvalidSszObjectsDir: "",
    proposerBoostEnabled: false,
    safeSlotsToImportOptimistically: lodestar_params_1.SAFE_SLOTS_TO_IMPORT_OPTIMISTICALLY,
};
//# sourceMappingURL=options.js.map