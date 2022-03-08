"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.parseArgs = void 0;
const lodestar_1 = require("@chainsafe/lodestar");
function parseArgs(args) {
    return {
        blsVerifyAllMultiThread: args["chain.blsVerifyAllMultiThread"],
        blsVerifyAllMainThread: args["chain.blsVerifyAllMainThread"],
        disableBlsBatchVerify: args["chain.disableBlsBatchVerify"],
        persistInvalidSszObjects: args["chain.persistInvalidSszObjects"],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        persistInvalidSszObjectsDir: undefined,
        proposerBoostEnabled: args["chain.proposerBoostEnabled"],
        safeSlotsToImportOptimistically: args["safe-slots-to-import-optimistically"],
    };
}
exports.parseArgs = parseArgs;
exports.options = {
    "chain.blsVerifyAllMultiThread": {
        hidden: true,
        type: "boolean",
        description: "Always use worker threads for BLS verification",
        defaultDescription: String(lodestar_1.defaultOptions.chain.blsVerifyAllMultiThread),
        group: "chain",
    },
    "chain.blsVerifyAllMainThread": {
        hidden: true,
        type: "boolean",
        description: "Always use main threads for BLS verification",
        defaultDescription: String(lodestar_1.defaultOptions.chain.blsVerifyAllMainThread),
        group: "chain",
    },
    "chain.disableBlsBatchVerify": {
        hidden: true,
        type: "boolean",
        description: "Do not use BLS batch verify to validate all block signatures at once. \
Will double processing times. Use only for debugging purposes.",
        defaultDescription: String(lodestar_1.defaultOptions.chain.blsVerifyAllMultiThread),
        group: "chain",
    },
    "chain.persistInvalidSszObjects": {
        hidden: true,
        type: "boolean",
        description: "Persist invalid ssz objects or not for debugging purpose",
        group: "chain",
    },
    "chain.proposerBoostEnabled": {
        type: "boolean",
        description: "Enable proposer boost to reward a timely block",
        defaultDescription: String(lodestar_1.defaultOptions.chain.proposerBoostEnabled),
        group: "chain",
    },
    "safe-slots-to-import-optimistically": {
        hidden: true,
        type: "number",
        description: "Slots from current (clock) slot till which its safe to import a block optimistically if the merge is not justified yet.",
        defaultDescription: String(lodestar_1.defaultOptions.chain.safeSlotsToImportOptimistically),
        group: "chain",
    },
};
//# sourceMappingURL=chain.js.map