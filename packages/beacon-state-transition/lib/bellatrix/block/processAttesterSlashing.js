"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAttesterSlashing = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const block_1 = require("../../allForks/block");
function processAttesterSlashing(state, attesterSlashing, verifySignatures = true) {
    (0, block_1.processAttesterSlashing)(lodestar_params_1.ForkName.bellatrix, state, attesterSlashing, verifySignatures);
}
exports.processAttesterSlashing = processAttesterSlashing;
//# sourceMappingURL=processAttesterSlashing.js.map