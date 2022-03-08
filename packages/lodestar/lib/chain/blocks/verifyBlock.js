"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyBlockStateTransition = exports.verifyBlockSanityChecks = exports.verifyBlock = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const ssz_1 = require("@chainsafe/ssz");
const lodestar_fork_choice_1 = require("@chainsafe/lodestar-fork-choice");
const errors_1 = require("../errors");
const regen_1 = require("../regen");
const interface_1 = require("../../executionEngine/interface");
/**
 * Fully verify a block to be imported immediately after. Does not produce any side-effects besides adding intermediate
 * states in the state cache through regen.
 */
async function verifyBlock(chain, partiallyVerifiedBlock, opts) {
    const parentBlock = verifyBlockSanityChecks(chain, partiallyVerifiedBlock);
    const { postState, executionStatus } = await verifyBlockStateTransition(chain, partiallyVerifiedBlock, opts);
    return {
        block: partiallyVerifiedBlock.block,
        postState,
        parentBlock,
        skipImportingAttestations: partiallyVerifiedBlock.skipImportingAttestations,
        executionStatus,
    };
}
exports.verifyBlock = verifyBlock;
/**
 * Verifies som early cheap sanity checks on the block before running the full state transition.
 *
 * - Parent is known to the fork-choice
 * - Check skipped slots limit
 * - check_block_relevancy()
 *   - Block not in the future
 *   - Not genesis block
 *   - Block's slot is < Infinity
 *   - Not finalized slot
 *   - Not already known
 */
function verifyBlockSanityChecks(chain, partiallyVerifiedBlock) {
    const { block } = partiallyVerifiedBlock;
    const blockSlot = block.message.slot;
    // Not genesis block
    if (blockSlot === 0) {
        throw new errors_1.BlockError(block, { code: errors_1.BlockErrorCode.GENESIS_BLOCK });
    }
    // Not finalized slot
    const finalizedSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(chain.forkChoice.getFinalizedCheckpoint().epoch);
    if (blockSlot <= finalizedSlot) {
        throw new errors_1.BlockError(block, { code: errors_1.BlockErrorCode.WOULD_REVERT_FINALIZED_SLOT, blockSlot, finalizedSlot });
    }
    // Parent is known to the fork-choice
    const parentRoot = (0, ssz_1.toHexString)(block.message.parentRoot);
    const parentBlock = chain.forkChoice.getBlockHex(parentRoot);
    if (!parentBlock) {
        throw new errors_1.BlockError(block, { code: errors_1.BlockErrorCode.PARENT_UNKNOWN, parentRoot });
    }
    // Check skipped slots limit
    // TODO
    // Block not in the future, also checks for infinity
    const currentSlot = chain.clock.currentSlot;
    if (blockSlot > currentSlot) {
        throw new errors_1.BlockError(block, { code: errors_1.BlockErrorCode.FUTURE_SLOT, blockSlot, currentSlot });
    }
    // Not already known
    const blockHash = (0, ssz_1.toHexString)(chain.config.getForkTypes(block.message.slot).BeaconBlock.hashTreeRoot(block.message));
    if (chain.forkChoice.hasBlockHex(blockHash)) {
        throw new errors_1.BlockError(block, { code: errors_1.BlockErrorCode.ALREADY_KNOWN, root: blockHash });
    }
    return parentBlock;
}
exports.verifyBlockSanityChecks = verifyBlockSanityChecks;
/**
 * Verifies a block is fully valid running the full state transition. To relieve the main thread signatures are
 * verified separately in workers with chain.bls worker pool.
 *
 * - Advance state to block's slot - per_slot_processing()
 * - STFN - per_block_processing()
 * - Check state root matches
 */
async function verifyBlockStateTransition(chain, partiallyVerifiedBlock, opts) {
    var _a;
    const { block, validProposerSignature, validSignatures } = partiallyVerifiedBlock;
    // TODO: Skip in process chain segment
    // Retrieve preState from cache (regen)
    const preState = await chain.regen.getPreState(block.message, regen_1.RegenCaller.processBlocksInEpoch).catch((e) => {
        throw new errors_1.BlockError(block, { code: errors_1.BlockErrorCode.PRESTATE_MISSING, error: e });
    });
    // STFN - per_slot_processing() + per_block_processing()
    // NOTE: `regen.getPreState()` should have dialed forward the state already caching checkpoint states
    const useBlsBatchVerify = !(opts === null || opts === void 0 ? void 0 : opts.disableBlsBatchVerify);
    const postState = lodestar_beacon_state_transition_1.allForks.stateTransition(preState, block, {
        // false because it's verified below with better error typing
        verifyStateRoot: false,
        // if block is trusted don't verify proposer or op signature
        verifyProposer: !useBlsBatchVerify && !validSignatures && !validProposerSignature,
        verifySignatures: !useBlsBatchVerify && !validSignatures,
    }, chain.metrics);
    // TODO: Review mergeBlock conditions
    /** Not null if execution is enabled */
    const executionPayloadEnabled = lodestar_beacon_state_transition_1.bellatrix.isBellatrixStateType(postState) &&
        lodestar_beacon_state_transition_1.bellatrix.isBellatrixBlockBodyType(block.message.body) &&
        lodestar_beacon_state_transition_1.bellatrix.isExecutionEnabled(postState, block.message.body)
        ? block.message.body.executionPayload
        : null;
    // Verify signatures after running state transition, so all SyncCommittee signed roots are known at this point.
    // We must ensure block.slot <= state.slot before running getAllBlockSignatureSets().
    // NOTE: If in the future multiple blocks signatures are verified at once, all blocks must be in the same epoch
    // so the attester and proposer shufflings are correct.
    if (useBlsBatchVerify && !validSignatures) {
        const signatureSets = validProposerSignature
            ? lodestar_beacon_state_transition_1.allForks.getAllBlockSignatureSetsExceptProposer(postState, block)
            : lodestar_beacon_state_transition_1.allForks.getAllBlockSignatureSets(postState, block);
        if (signatureSets.length > 0 &&
            !(await chain.bls.verifySignatureSets(signatureSets, {
                verifyOnMainThread: partiallyVerifiedBlock === null || partiallyVerifiedBlock === void 0 ? void 0 : partiallyVerifiedBlock.blsVerifyOnMainThread,
            }))) {
            throw new errors_1.BlockError(block, { code: errors_1.BlockErrorCode.INVALID_SIGNATURE, state: postState });
        }
    }
    let executionStatus;
    if (executionPayloadEnabled) {
        // TODO: Handle better notifyNewPayload() returning error is syncing
        const execResult = await chain.executionEngine.notifyNewPayload(
        // executionPayload must be serialized as JSON and the TreeBacked structure breaks the baseFeePerGas serializer
        // For clarity and since it's needed anyway, just send the struct representation at this level such that
        // notifyNewPayload() can expect a regular JS object.
        // TODO: If blocks are no longer TreeBacked, remove.
        executionPayloadEnabled.valueOf());
        switch (execResult.status) {
            case interface_1.ExecutePayloadStatus.VALID:
                executionStatus = lodestar_fork_choice_1.ExecutionStatus.Valid;
                chain.forkChoice.validateLatestHash(execResult.latestValidHash, null);
                break; // OK
            case interface_1.ExecutePayloadStatus.INVALID: {
                // If the parentRoot is not same as latestValidHash, then the branch from latestValidHash
                // to parentRoot needs to be invalidated
                const parentHashHex = (0, ssz_1.toHexString)(block.message.parentRoot);
                chain.forkChoice.validateLatestHash(execResult.latestValidHash, parentHashHex !== execResult.latestValidHash ? parentHashHex : null);
                throw new errors_1.BlockError(block, {
                    code: errors_1.BlockErrorCode.EXECUTION_ENGINE_ERROR,
                    execStatus: execResult.status,
                    errorMessage: (_a = execResult.validationError) !== null && _a !== void 0 ? _a : "",
                });
            }
            // Accepted and Syncing have the same treatment, as final validation of block is pending
            case interface_1.ExecutePayloadStatus.ACCEPTED:
            case interface_1.ExecutePayloadStatus.SYNCING: {
                // It's okay to ignore SYNCING status as EL could switch into syncing
                // 1. On intial startup/restart
                // 2. When some reorg might have occured and EL doesn't has a parent root
                //    (observed on devnets)
                // 3. Because of some unavailable (and potentially invalid) root but there is no way
                //    of knowing if this is invalid/unavailable. For unavailable block, some proposer
                //    will (sooner or later) build on the available parent head which will
                //    eventually win in fork-choice as other validators vote on VALID blocks.
                // Once EL catches up again and respond VALID, the fork choice will be updated which
                // will either validate or prune invalid blocks
                //
                // When to import such blocks:
                // From: https://github.com/ethereum/consensus-specs/pull/2770/files
                // A block MUST NOT be optimistically imported, unless either of the following
                // conditions are met:
                //
                // 1. The justified checkpoint has execution enabled
                // 2. The current slot (as per the system clock) is at least
                //    SAFE_SLOTS_TO_IMPORT_OPTIMISTICALLY ahead of the slot of the block being
                //    imported.
                const justifiedBlock = chain.forkChoice.getJustifiedBlock();
                const clockSlot = (0, lodestar_beacon_state_transition_1.getCurrentSlot)(chain.config, postState.genesisTime);
                if (justifiedBlock.executionStatus === lodestar_fork_choice_1.ExecutionStatus.PreMerge &&
                    block.message.slot + opts.safeSlotsToImportOptimistically > clockSlot) {
                    throw new errors_1.BlockError(block, {
                        code: errors_1.BlockErrorCode.EXECUTION_ENGINE_ERROR,
                        execStatus: interface_1.ExecutePayloadStatus.UNSAFE_OPTIMISTIC_STATUS,
                        errorMessage: `not safe to import ${execResult.status} payload within ${opts.safeSlotsToImportOptimistically} of currentSlot, status=${execResult.status}`,
                    });
                }
                executionStatus = lodestar_fork_choice_1.ExecutionStatus.Syncing;
                break;
            }
            // If the block has is not valid, or it referenced an invalid terminal block then the
            // block is invalid, however it has no bearing on any forkChoice cleanup
            //
            // There can be other reasons for which EL failed some of the observed ones are
            // 1. Connection refused / can't connect to EL port
            // 2. EL Internal Error
            // 3. Geth sometimes gives invalid merkel root error which means invalid
            //    but expects it to be handled in CL as of now. But we should log as warning
            //    and give it as optimistic treatment and expect any other non-geth CL<>EL
            //    combination to reject the invalid block and propose a block.
            //    On kintsugi devnet, this has been observed to cause contiguous proposal failures
            //    as the network is geth dominated, till a non geth node proposes and moves network
            //    forward
            // For network/unreachable errors, an optimization can be added to replay these blocks
            // back. But for now, lets assume other mechanisms like unknown parent block of a future
            // child block will cause it to replay
            case interface_1.ExecutePayloadStatus.INVALID_BLOCK_HASH:
            case interface_1.ExecutePayloadStatus.INVALID_TERMINAL_BLOCK:
            case interface_1.ExecutePayloadStatus.ELERROR:
            case interface_1.ExecutePayloadStatus.UNAVAILABLE:
                throw new errors_1.BlockError(block, {
                    code: errors_1.BlockErrorCode.EXECUTION_ENGINE_ERROR,
                    execStatus: execResult.status,
                    errorMessage: execResult.validationError,
                });
        }
    }
    else {
        // isExecutionEnabled() -> false
        executionStatus = lodestar_fork_choice_1.ExecutionStatus.PreMerge;
    }
    // Check state root matches
    if (!lodestar_types_1.ssz.Root.equals(block.message.stateRoot, postState.tree.root)) {
        throw new errors_1.BlockError(block, {
            code: errors_1.BlockErrorCode.INVALID_STATE_ROOT,
            root: postState.tree.root,
            expectedRoot: block.message.stateRoot.valueOf(),
            preState,
            postState,
        });
    }
    return { postState, executionStatus };
}
exports.verifyBlockStateTransition = verifyBlockStateTransition;
//# sourceMappingURL=verifyBlock.js.map