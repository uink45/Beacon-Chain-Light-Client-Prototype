"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBlock = exports.processSyncAggregate = exports.processVoluntaryExit = exports.processProposerSlashing = exports.processDeposit = exports.processAttesterSlashing = exports.RootCache = exports.processAttestations = exports.processOperations = void 0;
const block_1 = require("../../allForks/block");
const processOperations_1 = require("./processOperations");
Object.defineProperty(exports, "processOperations", { enumerable: true, get: function () { return processOperations_1.processOperations; } });
const processAttestation_1 = require("./processAttestation");
Object.defineProperty(exports, "processAttestations", { enumerable: true, get: function () { return processAttestation_1.processAttestations; } });
Object.defineProperty(exports, "RootCache", { enumerable: true, get: function () { return processAttestation_1.RootCache; } });
const processAttesterSlashing_1 = require("./processAttesterSlashing");
Object.defineProperty(exports, "processAttesterSlashing", { enumerable: true, get: function () { return processAttesterSlashing_1.processAttesterSlashing; } });
const processDeposit_1 = require("./processDeposit");
Object.defineProperty(exports, "processDeposit", { enumerable: true, get: function () { return processDeposit_1.processDeposit; } });
const processProposerSlashing_1 = require("./processProposerSlashing");
Object.defineProperty(exports, "processProposerSlashing", { enumerable: true, get: function () { return processProposerSlashing_1.processProposerSlashing; } });
const processVoluntaryExit_1 = require("./processVoluntaryExit");
Object.defineProperty(exports, "processVoluntaryExit", { enumerable: true, get: function () { return processVoluntaryExit_1.processVoluntaryExit; } });
const processSyncCommittee_1 = require("./processSyncCommittee");
Object.defineProperty(exports, "processSyncAggregate", { enumerable: true, get: function () { return processSyncCommittee_1.processSyncAggregate; } });
function processBlock(state, block, verifySignatures = true) {
    (0, block_1.processBlockHeader)(state, block);
    (0, block_1.processRandao)(state, block, verifySignatures);
    (0, block_1.processEth1Data)(state, block.body);
    (0, processOperations_1.processOperations)(state, block.body, verifySignatures);
    (0, processSyncCommittee_1.processSyncAggregate)(state, block, verifySignatures);
}
exports.processBlock = processBlock;
//# sourceMappingURL=index.js.map