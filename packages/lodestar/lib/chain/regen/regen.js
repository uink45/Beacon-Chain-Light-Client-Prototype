"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateRegenerator = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const ssz_1 = require("@chainsafe/ssz");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const errors_1 = require("./errors");
const checkpoint_1 = require("../blocks/utils/checkpoint");
const emitter_1 = require("../emitter");
/**
 * Regenerates states that have already been processed by the fork choice
 */
class StateRegenerator {
    constructor(modules) {
        this.modules = modules;
    }
    /**
     * Get the state to run with `block`. May be:
     * - If parent is in same epoch -> Exact state at `block.parentRoot`
     * - If parent is in prev epoch -> State after `block.parentRoot` dialed forward through epoch transition
     */
    async getPreState(block, rCaller) {
        const parentBlock = this.modules.forkChoice.getBlock(block.parentRoot);
        if (!parentBlock) {
            throw new errors_1.RegenError({
                code: errors_1.RegenErrorCode.BLOCK_NOT_IN_FORKCHOICE,
                blockRoot: block.parentRoot,
            });
        }
        const parentEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(parentBlock.slot);
        const blockEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(block.slot);
        // This may save us at least one epoch transition.
        // If the requested state crosses an epoch boundary
        // then we may use the checkpoint state before the block
        // We may have the checkpoint state with parent root inside the checkpoint state cache
        // through gossip validation.
        if (parentEpoch < blockEpoch) {
            return await this.getCheckpointState({ root: block.parentRoot, epoch: blockEpoch }, rCaller);
        }
        // Otherwise, get the state normally.
        return await this.getState(parentBlock.stateRoot, rCaller);
    }
    /**
     * Get state after block `cp.root` dialed forward to first slot of `cp.epoch`
     */
    async getCheckpointState(cp, rCaller) {
        const checkpointStartSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(cp.epoch);
        return await this.getBlockSlotState((0, ssz_1.toHexString)(cp.root), checkpointStartSlot, rCaller);
    }
    /**
     * Get state after block `blockRoot` dialed forward to `slot`
     */
    async getBlockSlotState(blockRoot, slot, rCaller) {
        const block = this.modules.forkChoice.getBlockHex(blockRoot);
        if (!block) {
            throw new errors_1.RegenError({
                code: errors_1.RegenErrorCode.BLOCK_NOT_IN_FORKCHOICE,
                blockRoot,
            });
        }
        if (slot < block.slot) {
            throw new errors_1.RegenError({
                code: errors_1.RegenErrorCode.SLOT_BEFORE_BLOCK_SLOT,
                slot,
                blockSlot: block.slot,
            });
        }
        const latestCheckpointStateCtx = this.modules.checkpointStateCache.getLatest(blockRoot, (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot));
        // If a checkpoint state exists with the given checkpoint root, it either is in requested epoch
        // or needs to have empty slots processed until the requested epoch
        if (latestCheckpointStateCtx) {
            return await processSlotsByCheckpoint(this.modules, latestCheckpointStateCtx, slot);
        }
        // Otherwise, use the fork choice to get the stateRoot from block at the checkpoint root
        // regenerate that state,
        // then process empty slots until the requested epoch
        const blockStateCtx = await this.getState(block.stateRoot, rCaller);
        return await processSlotsByCheckpoint(this.modules, blockStateCtx, slot);
    }
    /**
     * Get state by exact root. If not in cache directly, requires finding the block that references the state from the
     * forkchoice and replaying blocks to get to it.
     */
    async getState(stateRoot, _rCaller) {
        // Trivial case, state at stateRoot is already cached
        const cachedStateCtx = this.modules.stateCache.get(stateRoot);
        if (cachedStateCtx) {
            return cachedStateCtx;
        }
        // Otherwise we have to use the fork choice to traverse backwards, block by block,
        // searching the state caches
        // then replay blocks forward to the desired stateRoot
        const block = this.findFirstStateBlock(stateRoot);
        // blocks to replay, ordered highest to lowest
        // gets reversed when replayed
        const blocksToReplay = [block];
        let state = null;
        for (const b of this.modules.forkChoice.iterateAncestorBlocks(block.parentRoot)) {
            state = this.modules.stateCache.get(b.stateRoot);
            if (state) {
                break;
            }
            state = this.modules.checkpointStateCache.getLatest(b.blockRoot, (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(blocksToReplay[blocksToReplay.length - 1].slot - 1));
            if (state) {
                break;
            }
            blocksToReplay.push(b);
        }
        if (state === null) {
            throw new errors_1.RegenError({
                code: errors_1.RegenErrorCode.NO_SEED_STATE,
            });
        }
        const MAX_EPOCH_TO_PROCESS = 5;
        if (blocksToReplay.length > MAX_EPOCH_TO_PROCESS * lodestar_params_1.SLOTS_PER_EPOCH) {
            throw new errors_1.RegenError({
                code: errors_1.RegenErrorCode.TOO_MANY_BLOCK_PROCESSED,
                stateRoot,
            });
        }
        for (const b of blocksToReplay.reverse()) {
            const structBlock = await this.modules.db.block.get((0, ssz_1.fromHexString)(b.blockRoot));
            if (!structBlock) {
                throw Error(`No block found for ${b.blockRoot}`);
            }
            const block = this.modules.config.getForkTypes(b.slot).SignedBeaconBlock.createTreeBackedFromStruct(structBlock);
            if (block === undefined) {
                throw new errors_1.RegenError({
                    code: errors_1.RegenErrorCode.BLOCK_NOT_IN_DB,
                    blockRoot: b.blockRoot,
                });
            }
            try {
                // Only advances state trusting block's signture and hashes.
                // We are only running the state transition to get a specific state's data.
                state = lodestar_beacon_state_transition_1.allForks.stateTransition(state, block, {
                    verifyStateRoot: false,
                    verifyProposer: false,
                    verifySignatures: false,
                }, null);
                // TODO: Persist states, note that regen could be triggered by old states.
                // Should those take a place in the cache?
                // this avoids keeping our node busy processing blocks
                await (0, lodestar_utils_1.sleep)(0);
            }
            catch (e) {
                throw new errors_1.RegenError({
                    code: errors_1.RegenErrorCode.STATE_TRANSITION_ERROR,
                    error: e,
                });
            }
        }
        return state;
    }
    findFirstStateBlock(stateRoot) {
        for (const block of this.modules.forkChoice.forwarditerateAncestorBlocks()) {
            if (block !== undefined) {
                return block;
            }
        }
        throw new errors_1.RegenError({
            code: errors_1.RegenErrorCode.STATE_NOT_IN_FORKCHOICE,
            stateRoot,
        });
    }
}
exports.StateRegenerator = StateRegenerator;
/**
 * Starting at `state.slot`,
 * process slots forward towards `slot`,
 * emitting "checkpoint" events after every epoch processed.
 */
async function processSlotsByCheckpoint(modules, preState, slot) {
    let postState = await processSlotsToNearestCheckpoint(modules, preState, slot);
    if (postState.slot < slot) {
        postState = lodestar_beacon_state_transition_1.allForks.processSlots(postState, slot, modules.metrics);
    }
    return postState;
}
/**
 * Starting at `state.slot`,
 * process slots forward towards `slot`,
 * emitting "checkpoint" events after every epoch processed.
 *
 * Stops processing after no more full epochs can be processed.
 */
async function processSlotsToNearestCheckpoint(modules, preState, slot) {
    const preSlot = preState.slot;
    const postSlot = slot;
    const preEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(preSlot);
    let postState = preState.clone();
    const { checkpointStateCache, emitter, metrics } = modules;
    for (let nextEpochSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(preEpoch + 1); nextEpochSlot <= postSlot; nextEpochSlot += lodestar_params_1.SLOTS_PER_EPOCH) {
        postState = lodestar_beacon_state_transition_1.allForks.processSlots(postState, nextEpochSlot, metrics);
        // Cache state to preserve epoch transition work
        const checkpointState = postState.clone();
        const cp = (0, checkpoint_1.getCheckpointFromState)(checkpointState);
        checkpointStateCache.add(cp, checkpointState);
        emitter.emit(emitter_1.ChainEvent.checkpoint, cp, checkpointState);
        // this avoids keeping our node busy processing blocks
        await (0, lodestar_utils_1.sleep)(0);
    }
    return postState;
}
//# sourceMappingURL=regen.js.map