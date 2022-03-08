"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDeposit = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const block_1 = require("../../allForks/block");
function processDeposit(state, deposit) {
    (0, block_1.processDeposit)(lodestar_params_1.ForkName.altair, state, deposit);
}
exports.processDeposit = processDeposit;
//# sourceMappingURL=processDeposit.js.map