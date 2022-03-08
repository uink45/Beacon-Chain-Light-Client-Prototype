"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVoluntaryExit = void 0;
const block_1 = require("../../allForks/block");
function processVoluntaryExit(state, signedVoluntaryExit, verifySignature = true) {
    (0, block_1.processVoluntaryExitAllForks)(state, signedVoluntaryExit, verifySignature);
}
exports.processVoluntaryExit = processVoluntaryExit;
//# sourceMappingURL=processVoluntaryExit.js.map