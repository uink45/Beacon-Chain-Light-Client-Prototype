"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSlots = exports.processBlock = exports.stateTransition = exports.upgradeStateByFork = void 0;
/* eslint-disable import/namespace */
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const ssz_1 = require("@chainsafe/ssz");
const phase0 = __importStar(require("../phase0"));
const altair = __importStar(require("../altair"));
const bellatrix = __importStar(require("../bellatrix"));
const epochProcess_1 = require("../cache/epochProcess");
const signatureSets_1 = require("./signatureSets");
const slot_1 = require("./slot");
const util_1 = require("../util");
const processBlockByFork = {
    [lodestar_params_1.ForkName.phase0]: phase0.processBlock,
    [lodestar_params_1.ForkName.altair]: altair.processBlock,
    [lodestar_params_1.ForkName.bellatrix]: bellatrix.processBlock,
};
const processEpochByFork = {
    [lodestar_params_1.ForkName.phase0]: phase0.processEpoch,
    [lodestar_params_1.ForkName.altair]: altair.processEpoch,
    [lodestar_params_1.ForkName.bellatrix]: altair.processEpoch,
};
exports.upgradeStateByFork = {
    [lodestar_params_1.ForkName.altair]: altair.upgradeState,
    [lodestar_params_1.ForkName.bellatrix]: bellatrix.upgradeState,
};
// Multifork capable state transition
/**
 * Implementation Note: follows the optimizations in protolambda's eth2fastspec (https://github.com/protolambda/eth2fastspec)
 */
function stateTransition(state, signedBlock, options, metrics) {
    const { verifyStateRoot = true, verifyProposer = true } = options || {};
    const block = signedBlock.message;
    const blockSlot = block.slot;
    let postState = state.clone();
    // Turn caches into a data-structure optimized for fast writes
    postState.setStateCachesAsTransient();
    // Process slots (including those with no blocks) since block.
    // Includes state upgrades
    postState = processSlotsWithTransientCache(postState, blockSlot, metrics);
    // Verify proposer signature only
    if (verifyProposer) {
        if (!(0, signatureSets_1.verifyProposerSignature)(postState, signedBlock)) {
            throw new Error("Invalid block signature");
        }
    }
    // Process block
    processBlock(postState, block, options, metrics);
    // Verify state root
    if (verifyStateRoot) {
        if (!lodestar_types_1.ssz.Root.equals(block.stateRoot, postState.tree.root)) {
            throw new Error(`Invalid state root at slot ${block.slot}, expected=${(0, ssz_1.toHexString)(block.stateRoot)}, actual=${(0, ssz_1.toHexString)(postState.tree.root)}`);
        }
    }
    // Turn caches into a data-structure optimized for hashing and structural sharing
    postState.setStateCachesAsPersistent();
    return postState;
}
exports.stateTransition = stateTransition;
/**
 * Multifork capable processBlock()
 *
 * Implementation Note: follows the optimizations in protolambda's eth2fastspec (https://github.com/protolambda/eth2fastspec)
 */
function processBlock(postState, block, options, metrics) {
    const { verifySignatures = true } = options || {};
    const fork = postState.config.getForkName(block.slot);
    const timer = metrics === null || metrics === void 0 ? void 0 : metrics.stfnProcessBlock.startTimer();
    try {
        processBlockByFork[fork](postState, block, verifySignatures);
    }
    finally {
        if (timer)
            timer();
    }
}
exports.processBlock = processBlock;
/**
 * Like `processSlots` from the spec but additionally handles fork upgrades
 *
 * Implementation Note: follows the optimizations in protolambda's eth2fastspec (https://github.com/protolambda/eth2fastspec)
 */
function processSlots(state, slot, metrics) {
    let postState = state.clone();
    // Turn caches into a data-structure optimized for fast writes
    postState.setStateCachesAsTransient();
    postState = processSlotsWithTransientCache(postState, slot, metrics);
    // Turn caches into a data-structure optimized for hashing and structural sharing
    postState.setStateCachesAsPersistent();
    return postState;
}
exports.processSlots = processSlots;
/**
 * All processSlot() logic but separate so stateTransition() can recycle the caches
 */
function processSlotsWithTransientCache(postState, slot, metrics) {
    const { config } = postState;
    if (postState.slot > slot) {
        throw Error(`Too old slot ${slot}, current=${postState.slot}`);
    }
    while (postState.slot < slot) {
        (0, slot_1.processSlot)(postState);
        // Process epoch on the first slot of the next epoch
        if ((postState.slot + 1) % lodestar_params_1.SLOTS_PER_EPOCH === 0) {
            // At fork boundary we don't want to process "next fork" epoch before upgrading state
            const fork = postState.config.getForkName(postState.slot);
            const timer = metrics === null || metrics === void 0 ? void 0 : metrics.stfnEpochTransition.startTimer();
            try {
                const epochProcess = (0, epochProcess_1.beforeProcessEpoch)(postState);
                processEpochByFork[fork](postState, epochProcess);
                const { currentEpoch, statuses, balances } = epochProcess;
                metrics === null || metrics === void 0 ? void 0 : metrics.registerValidatorStatuses(currentEpoch, statuses, balances);
                postState.slot++;
                postState.epochCtx.afterProcessEpoch(postState, epochProcess);
            }
            finally {
                if (timer)
                    timer();
            }
            // Upgrade state if exactly at epoch boundary
            const stateSlot = (0, util_1.computeEpochAtSlot)(postState.slot);
            if (stateSlot === config.ALTAIR_FORK_EPOCH) {
                postState = altair.upgradeState(postState);
            }
            if (stateSlot === config.BELLATRIX_FORK_EPOCH) {
                postState = bellatrix.upgradeState(postState);
            }
        }
        else {
            postState.slot++;
        }
    }
    return postState;
}
//# sourceMappingURL=stateTransition.js.map