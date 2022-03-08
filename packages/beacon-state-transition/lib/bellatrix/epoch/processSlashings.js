"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSlashings = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const processSlashings_1 = require("../../allForks/epoch/processSlashings");
function processSlashings(state, epochProcess) {
    (0, processSlashings_1.processSlashingsAllForks)(lodestar_params_1.ForkName.bellatrix, state, epochProcess);
}
exports.processSlashings = processSlashings;
//# sourceMappingURL=processSlashings.js.map