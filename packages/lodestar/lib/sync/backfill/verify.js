"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyBlockProposerSignature = exports.verifyBlockSequence = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const errors_1 = require("./errors");
function verifyBlockSequence(config, blocks, anchorRoot) {
    let nextRoot = anchorRoot;
    let nextAnchor = null;
    const verifiedBlocks = [];
    for (const block of blocks.reverse()) {
        const blockRoot = config.getForkTypes(block.message.slot).BeaconBlock.hashTreeRoot(block.message);
        if (!lodestar_types_1.ssz.Root.equals(blockRoot, nextRoot)) {
            if (lodestar_types_1.ssz.Root.equals(nextRoot, anchorRoot)) {
                throw new errors_1.BackfillSyncError({ code: errors_1.BackfillSyncErrorCode.NOT_ANCHORED });
            }
            return { nextAnchor, verifiedBlocks, error: errors_1.BackfillSyncErrorCode.NOT_LINEAR };
        }
        verifiedBlocks.push(block);
        nextAnchor = { block, slot: block.message.slot, root: nextRoot };
        nextRoot = block.message.parentRoot;
    }
    return { nextAnchor, verifiedBlocks };
}
exports.verifyBlockSequence = verifyBlockSequence;
async function verifyBlockProposerSignature(bls, state, blocks) {
    if (blocks.length === 1 && blocks[0].message.slot === lodestar_params_1.GENESIS_SLOT)
        return;
    const signatures = blocks.reduce((sigs, block) => {
        // genesis block doesn't have valid signature
        if (block.message.slot !== lodestar_params_1.GENESIS_SLOT)
            sigs.push(lodestar_beacon_state_transition_1.allForks.getProposerSignatureSet(state, block));
        return sigs;
    }, []);
    if (!(await bls.verifySignatureSets(signatures, { batchable: true }))) {
        throw new errors_1.BackfillSyncError({ code: errors_1.BackfillSyncErrorCode.INVALID_SIGNATURE });
    }
}
exports.verifyBlockProposerSignature = verifyBlockProposerSignature;
//# sourceMappingURL=verify.js.map