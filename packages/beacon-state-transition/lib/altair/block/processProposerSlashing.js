"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processProposerSlashing = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const block_1 = require("../../allForks/block");
function processProposerSlashing(state, proposerSlashing, verifySignatures = true) {
    (0, block_1.processProposerSlashing)(lodestar_params_1.ForkName.altair, state, proposerSlashing, verifySignatures);
}
exports.processProposerSlashing = processProposerSlashing;
//# sourceMappingURL=processProposerSlashing.js.map