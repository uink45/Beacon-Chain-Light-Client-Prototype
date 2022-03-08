"use strict";
/**
 * @module chain/blockAssembly
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleBlock = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const ssz_1 = require("@chainsafe/ssz");
const constants_1 = require("../../../constants");
const body_1 = require("./body");
const regen_1 = require("../../regen");
async function assembleBlock({ chain, metrics }, { randaoReveal, graffiti, slot, feeRecipient, }) {
    const head = chain.forkChoice.getHead();
    const state = await chain.regen.getBlockSlotState(head.blockRoot, slot, regen_1.RegenCaller.produceBlock);
    const parentBlockRoot = (0, ssz_1.fromHexString)(head.blockRoot);
    const block = {
        slot,
        proposerIndex: state.getBeaconProposer(slot),
        parentRoot: parentBlockRoot,
        stateRoot: constants_1.ZERO_HASH,
        body: await (0, body_1.assembleBody)(chain, state, {
            randaoReveal,
            graffiti,
            blockSlot: slot,
            parentSlot: slot - 1,
            parentBlockRoot,
            feeRecipient,
        }),
    };
    block.stateRoot = computeNewStateRoot({ config: chain.config, metrics }, state, block);
    return block;
}
exports.assembleBlock = assembleBlock;
/**
 * Instead of running fastStateTransition(), only need to process block since
 * state is processed until block.slot already (this is to avoid double
 * epoch transition which happen at slot % 32 === 0)
 */
function computeNewStateRoot({ config, metrics }, state, block) {
    const postState = state.clone();
    // verifySignatures = false since the data to assemble the block is trusted
    lodestar_beacon_state_transition_1.allForks.processBlock(postState, block, { verifySignatures: false }, metrics);
    return config.getForkTypes(state.slot).BeaconState.hashTreeRoot(postState);
}
//# sourceMappingURL=index.js.map