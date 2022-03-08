"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBlock = exports.processProposerSlashing = exports.processAttesterSlashing = exports.processOperations = void 0;
const block_1 = require("../../allForks/block");
const processOperations_1 = require("./processOperations");
Object.defineProperty(exports, "processOperations", { enumerable: true, get: function () { return processOperations_1.processOperations; } });
const processSyncCommittee_1 = require("../../altair/block/processSyncCommittee");
const processExecutionPayload_1 = require("./processExecutionPayload");
const utils_1 = require("../utils");
const processAttesterSlashing_1 = require("./processAttesterSlashing");
Object.defineProperty(exports, "processAttesterSlashing", { enumerable: true, get: function () { return processAttesterSlashing_1.processAttesterSlashing; } });
const processProposerSlashing_1 = require("./processProposerSlashing");
Object.defineProperty(exports, "processProposerSlashing", { enumerable: true, get: function () { return processProposerSlashing_1.processProposerSlashing; } });
function processBlock(state, block, verifySignatures = true, executionEngine) {
    (0, block_1.processBlockHeader)(state, block);
    // The call to the process_execution_payload must happen before the call to the process_randao as the former depends
    // on the randao_mix computed with the reveal of the previous block.
    if ((0, utils_1.isExecutionEnabled)(state, block.body)) {
        (0, processExecutionPayload_1.processExecutionPayload)(state, block.body.executionPayload, executionEngine);
    }
    (0, block_1.processRandao)(state, block, verifySignatures);
    (0, block_1.processEth1Data)(state, block.body);
    (0, processOperations_1.processOperations)(state, block.body, verifySignatures);
    (0, processSyncCommittee_1.processSyncAggregate)(state, block, verifySignatures);
}
exports.processBlock = processBlock;
//# sourceMappingURL=index.js.map