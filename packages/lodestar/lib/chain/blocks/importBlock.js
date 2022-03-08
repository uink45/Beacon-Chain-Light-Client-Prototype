"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importBlock = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const ssz_1 = require("@chainsafe/ssz");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_fork_choice_1 = require("@chainsafe/lodestar-fork-choice");
const constants_1 = require("../../constants");
const stateCache_1 = require("../stateCache");
const emitter_1 = require("../emitter");
const checkpoint_1 = require("./utils/checkpoint");
const pendingEvents_1 = require("./utils/pendingEvents");
// import {ForkChoiceError, ForkChoiceErrorCode} from "@chainsafe/lodestar-fork-choice/lib/forkChoice/errors";
/**
 * Fork-choice allows to import attestations from current (0) or past (1) epoch.
 */
const FORK_CHOICE_ATT_EPOCH_LIMIT = 1;
/**
 * Imports a fully verified block into the chain state. Produces multiple permanent side-effects.
 *
 * Import block:
 * - Observe attestations
 * - Add validators to the pubkey cache
 * - Load shuffling caches
 * - Do weak subjectivy check
 * - Register block with fork-hoice
 * - Register state and block to the validator monitor
 * - For each attestation
 *   - Get indexed attestation
 *   - Register attestation with fork-choice
 *   - Register attestation with validator monitor (only after sync)
 * - Write block and state to hot db
 * - Write block and state to snapshot_cache
 * - head_tracker.register_block(block_root, parent_root, slot)
 * - Send events after everything is done
 */
async function importBlock(chain, fullyVerifiedBlock) {
    var _a, _b, _c, _d;
    const { block, postState, parentBlock, skipImportingAttestations, executionStatus } = fullyVerifiedBlock;
    const pendingEvents = new pendingEvents_1.PendingEvents(chain.emitter);
    // - Observe attestations
    // TODO
    // - Add validators to the pubkey cache
    // TODO
    // - Load shuffling caches
    // TODO
    // - Do weak subjectivy check
    // TODO
    // - Register block with fork-hoice
    // TODO IDEA: Lighthouse keeps a cache of checkpoint balances internally in the forkchoice store to be used latter
    // Ref: https://github.com/sigp/lighthouse/blob/f9bba92db3468321b28ddd9010e26b359f88bafe/beacon_node/beacon_chain/src/beacon_fork_choice_store.rs#L79
    //
    // current justified checkpoint should be prev epoch or current epoch if it's just updated
    // it should always have epochBalances there bc it's a checkpoint state, ie got through processEpoch
    const justifiedCheckpoint = postState.currentJustifiedCheckpoint;
    const onBlockPrecachedData = {
        executionStatus,
        blockDelaySec: (Math.floor(Date.now() / 1000) - postState.genesisTime) % chain.config.SECONDS_PER_SLOT,
    };
    if (justifiedCheckpoint.epoch > chain.forkChoice.getJustifiedCheckpoint().epoch) {
        const state = getStateForJustifiedBalances(chain, postState, block);
        onBlockPrecachedData.justifiedBalances = (0, lodestar_beacon_state_transition_1.getEffectiveBalanceIncrementsZeroInactive)(state);
    }
    if (lodestar_beacon_state_transition_1.bellatrix.isBellatrixStateType(postState) &&
        lodestar_beacon_state_transition_1.bellatrix.isBellatrixBlockBodyType(block.message.body) &&
        lodestar_beacon_state_transition_1.bellatrix.isMergeTransitionBlock(postState, block.message.body)) {
        // pow_block = get_pow_block(block.body.execution_payload.parent_hash)
        const powBlockRootHex = (0, ssz_1.toHexString)(block.message.body.executionPayload.parentHash);
        const powBlock = await chain.eth1.getPowBlock(powBlockRootHex);
        if (!powBlock && executionStatus !== lodestar_fork_choice_1.ExecutionStatus.Syncing)
            throw Error(`merge block parent POW block not found ${powBlockRootHex}`);
        // pow_parent = get_pow_block(pow_block.parent_hash)
        const powBlockParent = powBlock && (await chain.eth1.getPowBlock(powBlock.parentHash));
        if (powBlock && !powBlockParent)
            throw Error(`merge block parent's parent POW block not found ${powBlock.parentHash}`);
        onBlockPrecachedData.powBlock = powBlock;
        onBlockPrecachedData.powBlockParent = powBlockParent;
        onBlockPrecachedData.isMergeTransitionBlock = true;
    }
    const prevFinalizedEpoch = chain.forkChoice.getFinalizedCheckpoint().epoch;
    chain.forkChoice.onBlock(block.message, postState, onBlockPrecachedData);
    // - Register state and block to the validator monitor
    // TODO
    const currentEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(chain.forkChoice.getTime());
    const blockEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(block.message.slot);
    // - For each attestation
    //   - Get indexed attestation
    //   - Register attestation with fork-choice
    //   - Register attestation with validator monitor (only after sync)
    // Only process attestations of blocks with relevant attestations for the fork-choice:
    // If current epoch is N, and block is epoch X, block may include attestations for epoch X or X - 1.
    // The latest block that is useful is at epoch N - 1 which may include attestations for epoch N - 1 or N - 2.
    if (!skipImportingAttestations && blockEpoch >= currentEpoch - FORK_CHOICE_ATT_EPOCH_LIMIT) {
        const attestations = Array.from((0, ssz_1.readonlyValues)(block.message.body.attestations));
        const rootCache = new lodestar_beacon_state_transition_1.altair.RootCache(postState);
        const parentSlot = (_a = chain.forkChoice.getBlock(block.message.parentRoot)) === null || _a === void 0 ? void 0 : _a.slot;
        const invalidAttestationErrorsByCode = new Map();
        for (const attestation of attestations) {
            try {
                const indexedAttestation = postState.epochCtx.getIndexedAttestation(attestation);
                const targetEpoch = attestation.data.target.epoch;
                // Duplicated logic from fork-choice onAttestation validation logic.
                // Attestations outside of this range will be dropped as Errors, so no need to import
                if (targetEpoch <= currentEpoch && targetEpoch >= currentEpoch - FORK_CHOICE_ATT_EPOCH_LIMIT) {
                    chain.forkChoice.onAttestation(indexedAttestation);
                }
                if (parentSlot !== undefined) {
                    (_b = chain.metrics) === null || _b === void 0 ? void 0 : _b.registerAttestationInBlock(indexedAttestation, parentSlot, rootCache);
                }
                pendingEvents.push(emitter_1.ChainEvent.attestation, attestation);
            }
            catch (e) {
                // a block has a lot of attestations and it may has same error, we don't want to log all of them
                if (e instanceof lodestar_fork_choice_1.ForkChoiceError && e.type.code === lodestar_fork_choice_1.ForkChoiceErrorCode.INVALID_ATTESTATION) {
                    let errWithCount = invalidAttestationErrorsByCode.get(e.type.err.code);
                    if (errWithCount === undefined) {
                        errWithCount = { error: e, count: 1 };
                        invalidAttestationErrorsByCode.set(e.type.err.code, errWithCount);
                    }
                    else {
                        errWithCount.count++;
                    }
                }
                else {
                    // always log other errors
                    chain.logger.warn("Error processing attestation from block", { slot: block.message.slot }, e);
                }
            }
        }
        for (const { error, count } of invalidAttestationErrorsByCode.values()) {
            chain.logger.warn("Error processing attestations from block", { slot: block.message.slot, erroredAttestations: count }, error);
        }
    }
    // - Write block and state to hot db
    // - Write block and state to snapshot_cache
    if (block.message.slot % lodestar_params_1.SLOTS_PER_EPOCH === 0) {
        // Cache state to preserve epoch transition work
        const checkpointState = postState.clone();
        const cp = (0, checkpoint_1.getCheckpointFromState)(checkpointState);
        chain.checkpointStateCache.add(cp, checkpointState);
        pendingEvents.push(emitter_1.ChainEvent.checkpoint, cp, checkpointState);
    }
    // Emit ChainEvent.forkChoiceHead event
    const oldHead = chain.forkChoice.getHead();
    chain.forkChoice.updateHead();
    const newHead = chain.forkChoice.getHead();
    if (newHead.blockRoot !== oldHead.blockRoot) {
        // new head
        pendingEvents.push(emitter_1.ChainEvent.forkChoiceHead, newHead);
        (_c = chain.metrics) === null || _c === void 0 ? void 0 : _c.forkChoiceChangedHead.inc();
        const distance = chain.forkChoice.getCommonAncestorDistance(oldHead, newHead);
        if (distance !== null) {
            // chain reorg
            pendingEvents.push(emitter_1.ChainEvent.forkChoiceReorg, newHead, oldHead, distance);
            (_d = chain.metrics) === null || _d === void 0 ? void 0 : _d.forkChoiceReorg.inc();
        }
    }
    // NOTE: forkChoice.fsStore.finalizedCheckpoint MUST only change is response to an onBlock event
    // Notify execution layer of head and finalized updates
    const currFinalizedEpoch = chain.forkChoice.getFinalizedCheckpoint().epoch;
    if (newHead.blockRoot !== oldHead.blockRoot || currFinalizedEpoch !== prevFinalizedEpoch) {
        /**
         * On post BELLATRIX_EPOCH but pre TTD, blocks include empty execution payload with a zero block hash.
         * The consensus clients must not send notifyForkchoiceUpdate before TTD since the execution client will error.
         * So we must check that:
         * - `headBlockHash !== null` -> Pre BELLATRIX_EPOCH
         * - `headBlockHash !== ZERO_HASH` -> Pre TTD
         */
        const headBlockHash = chain.forkChoice.getHead().executionPayloadBlockHash;
        /**
         * After BELLATRIX_EPOCH and TTD it's okay to send a zero hash block hash for the finalized block. This will happen if
         * the current finalized block does not contain any execution payload at all (pre MERGE_EPOCH) or if it contains a
         * zero block hash (pre TTD)
         */
        const finalizedBlockHash = chain.forkChoice.getFinalizedBlock().executionPayloadBlockHash;
        if (headBlockHash !== null && headBlockHash !== constants_1.ZERO_HASH_HEX) {
            chain.executionEngine.notifyForkchoiceUpdate(headBlockHash, finalizedBlockHash !== null && finalizedBlockHash !== void 0 ? finalizedBlockHash : constants_1.ZERO_HASH_HEX).catch((e) => {
                chain.logger.error("Error pushing notifyForkchoiceUpdate()", { headBlockHash, finalizedBlockHash }, e);
            });
        }
    }
    // Emit ChainEvent.block event
    //
    // TODO: Move internal emitter onBlock() code here
    // MUST happen before any other block is processed
    // This adds the state necessary to process the next block
    chain.stateCache.add(postState);
    await chain.db.block.add(block);
    // Lightclient server support (only after altair)
    // - Persist state witness
    // - Use block's syncAggregate
    if ((0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(block.message.slot) >= chain.config.ALTAIR_FORK_EPOCH) {
        try {
            chain.lightClientServer.onImportBlock(block.message, postState, parentBlock);
        }
        catch (e) {
            chain.logger.error("Error lightClientServer.onImportBlock", { slot: block.message.slot }, e);
        }
    }
    // - head_tracker.register_block(block_root, parent_root, slot)
    // - Send event after everything is done
    // Emit all events at once after fully completing importBlock()
    chain.emitter.emit(emitter_1.ChainEvent.block, block, postState);
    pendingEvents.emit();
}
exports.importBlock = importBlock;
/**
 * Returns the closest state to postState.currentJustifiedCheckpoint in the same fork as postState
 *
 * From the spec https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/fork-choice.md#get_latest_attesting_balance
 * The state from which to read balances is:
 *
 * ```python
 * state = store.checkpoint_states[store.justified_checkpoint]
 * ```
 *
 * ```python
 * def store_target_checkpoint_state(store: Store, target: Checkpoint) -> None:
 *    # Store target checkpoint state if not yet seen
 *    if target not in store.checkpoint_states:
 *        base_state = copy(store.block_states[target.root])
 *        if base_state.slot < compute_start_slot_at_epoch(target.epoch):
 *            process_slots(base_state, compute_start_slot_at_epoch(target.epoch))
 *        store.checkpoint_states[target] = base_state
 * ```
 *
 * So the state to get justified balances is the post state of `checkpoint.root` dialed forward to the first slot in
 * `checkpoint.epoch` if that block is not in `checkpoint.epoch`.
 */
function getStateForJustifiedBalances(chain, postState, block) {
    const justifiedCheckpoint = postState.currentJustifiedCheckpoint;
    const checkpointHex = (0, stateCache_1.toCheckpointHex)(justifiedCheckpoint);
    const checkpointSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(checkpointHex.epoch);
    // First, check if the checkpoint block in the checkpoint epoch, by getting the block summary from the fork-choice
    const checkpointBlock = chain.forkChoice.getBlockHex(checkpointHex.rootHex);
    if (!checkpointBlock) {
        // Should never happen
        return postState;
    }
    // NOTE: The state of block checkpointHex.rootHex may be prior to the justified checkpoint if it was a skipped slot.
    if (checkpointBlock.slot >= checkpointSlot) {
        const checkpointBlockState = chain.stateCache.get(checkpointBlock.stateRoot);
        if (checkpointBlockState) {
            return checkpointBlockState;
        }
    }
    // If here, the first slot of `checkpoint.epoch` is a skipped slot. Check if the state is in the checkpoint cache.
    // NOTE: This state and above are correct with the spec.
    // NOTE: If the first slot of the epoch was skipped and the node is syncing, this state won't be in the cache.
    const state = chain.checkpointStateCache.get(checkpointHex);
    if (state) {
        return state;
    }
    // If it's not found, then find the oldest state in the same chain as this one
    // NOTE: If `block.message.parentRoot` is not in the fork-choice, `iterateAncestorBlocks()` returns `[]`
    // NOTE: This state is not be correct with the spec, it may have extra modifications from multiple blocks.
    //       However, it's a best effort before triggering an async regen process. In the future this should be fixed
    //       to use regen and get the correct state.
    let oldestState = postState;
    for (const parentBlock of chain.forkChoice.iterateAncestorBlocks((0, ssz_1.toHexString)(block.message.parentRoot))) {
        // We want at least a state at the slot 0 of checkpoint.epoch
        if (parentBlock.slot < checkpointSlot) {
            break;
        }
        const parentBlockState = chain.stateCache.get(parentBlock.stateRoot);
        if (parentBlockState) {
            oldestState = parentBlockState;
        }
    }
    // TODO: Use regen to get correct state. Note that making this function async can break the import flow.
    //       Also note that it can dead lock regen and block processing since both have a concurrency of 1.
    chain.logger.error("State for currentJustifiedCheckpoint not available, using closest state", {
        checkpointEpoch: checkpointHex.epoch,
        checkpointRoot: checkpointHex.rootHex,
        stateSlot: oldestState.slot,
        stateRoot: (0, ssz_1.toHexString)(oldestState.hashTreeRoot()),
    });
    return oldestState;
}
//# sourceMappingURL=importBlock.js.map