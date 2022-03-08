"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeProposerBoostScoreFromBalances = exports.ForkChoice = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const computeDeltas_1 = require("../protoArray/computeDeltas");
const interface_1 = require("../protoArray/interface");
const errors_1 = require("./errors");
const store_1 = require("./store");
/* eslint-disable max-len */
/**
 * Provides an implementation of "Ethereum 2.0 Phase 0 -- Beacon Chain Fork Choice":
 *
 * https://github.com/ethereum/eth2.0-specs/blob/v0.12.2/specs/phase0/fork-choice.md#ethereum-20-phase-0----beacon-chain-fork-choice
 *
 * ## Detail
 *
 * This class wraps `ProtoArray` and provides:
 *
 * - Management of validators latest messages and balances
 * - Management of the justified/finalized checkpoints as seen by fork choice
 * - Queuing of attestations from the current slot
 *
 * This class MUST be used with the following considerations:
 *
 * - Time is not updated automatically, updateTime MUST be called every slot
 */
class ForkChoice {
    /**
     * Instantiates a Fork Choice from some existing components
     *
     * This is useful if the existing components have been loaded from disk after a process restart.
     */
    constructor(config, fcStore, 
    /** The underlying representation of the block DAG. */
    protoArray, 
    /**
     * Balances currently tracked in the protoArray
     * Indexed by validator index
     *
     * This should be the balances of the state at fcStore.justifiedCheckpoint
     */
    justifiedBalances, proposerBoostEnabled, metrics) {
        this.config = config;
        this.fcStore = fcStore;
        this.protoArray = protoArray;
        this.justifiedBalances = justifiedBalances;
        this.proposerBoostEnabled = proposerBoostEnabled;
        this.metrics = metrics;
        /**
         * Votes currently tracked in the protoArray
         * Indexed by validator index
         * Each vote contains the latest message and previous message
         */
        this.votes = [];
        /**
         * Attestations that arrived at the current slot and must be queued for later processing.
         * NOT currently tracked in the protoArray
         */
        this.queuedAttestations = new Set();
        /** Avoid having to compute detas all the times. */
        this.synced = false;
        /**
         * Only cache attestation data root hex if it's tree backed since it's available.
         **/
        this.validatedAttestationDatas = new Set();
        /** Boost the entire branch with this proposer root as the leaf */
        this.proposerBoostRoot = null;
        /** Score to use in proposer boost, evaluated lazily from justified balances */
        this.justifiedProposerBoostScore = null;
        this.bestJustifiedBalances = justifiedBalances;
        this.head = this.updateHead();
    }
    /**
     * Returns the block root of an ancestor of `blockRoot` at the given `slot`.
     * (Note: `slot` refers to the block that is *returned*, not the one that is supplied.)
     *
     * NOTE: May be expensive: potentially walks through the entire fork of head to finalized block
     *
     * ### Specification
     *
     * Equivalent to:
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/fork-choice.md#get_ancestor
     */
    getAncestor(blockRoot, ancestorSlot) {
        const block = this.protoArray.getBlock(blockRoot);
        if (!block) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.MISSING_PROTO_ARRAY_BLOCK,
                root: blockRoot,
            });
        }
        if (block.slot > ancestorSlot) {
            // Search for a slot that is lte the target slot.
            // We check for lower slots to account for skip slots.
            for (const node of this.protoArray.iterateAncestorNodes(blockRoot)) {
                if (node.slot <= ancestorSlot) {
                    return node.blockRoot;
                }
            }
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.UNKNOWN_ANCESTOR,
                descendantRoot: blockRoot,
                ancestorSlot,
            });
        }
        else {
            // Root is older or equal than queried slot, thus a skip slot. Return most recent root prior to slot.
            return blockRoot;
        }
    }
    /**
     * Get the cached head root
     */
    getHeadRoot() {
        return this.getHead().blockRoot;
    }
    /**
     * Get the cached head
     */
    getHead() {
        return this.head;
    }
    /**
     * Get the proposer boost root
     */
    getProposerBoostRoot() {
        var _a;
        return (_a = this.proposerBoostRoot) !== null && _a !== void 0 ? _a : interface_1.HEX_ZERO_HASH;
    }
    /**
     * Run the fork choice rule to determine the head.
     * Update the head cache.
     *
     * Very expensive function (400ms / run as of Aug 2021). Call when the head really needs to be re-calculated.
     *
     * ## Specification
     *
     * Is equivalent to:
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.2/specs/phase0/fork-choice.md#get_head
     */
    updateHead() {
        // balances is not changed but votes are changed
        var _a, _b, _c, _d;
        let timer;
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.forkChoiceRequests.inc();
        try {
            let deltas;
            // Check if scores need to be calculated/updated
            if (!this.synced) {
                timer = (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.forkChoiceFindHead.startTimer();
                deltas = (0, computeDeltas_1.computeDeltas)(this.protoArray.indices, this.votes, this.justifiedBalances, this.justifiedBalances);
                /**
                 * The structure in line with deltas to propogate boost up the branch
                 * starting from the proposerIndex
                 */
                let proposerBoost = null;
                if (this.proposerBoostEnabled && this.proposerBoostRoot) {
                    const proposerBoostScore = (_c = this.justifiedProposerBoostScore) !== null && _c !== void 0 ? _c : computeProposerBoostScoreFromBalances(this.justifiedBalances, {
                        slotsPerEpoch: lodestar_params_1.SLOTS_PER_EPOCH,
                        proposerScoreBoost: this.config.PROPOSER_SCORE_BOOST,
                    });
                    proposerBoost = { root: this.proposerBoostRoot, score: proposerBoostScore };
                    this.justifiedProposerBoostScore = proposerBoostScore;
                }
                this.protoArray.applyScoreChanges({
                    deltas,
                    proposerBoost,
                    justifiedEpoch: this.fcStore.justifiedCheckpoint.epoch,
                    justifiedRoot: this.fcStore.justifiedCheckpoint.rootHex,
                    finalizedEpoch: this.fcStore.finalizedCheckpoint.epoch,
                    finalizedRoot: this.fcStore.finalizedCheckpoint.rootHex,
                });
                this.synced = true;
            }
            const headRoot = this.protoArray.findHead(this.fcStore.justifiedCheckpoint.rootHex);
            const headIndex = this.protoArray.indices.get(headRoot);
            if (headIndex === undefined) {
                throw new errors_1.ForkChoiceError({
                    code: errors_1.ForkChoiceErrorCode.MISSING_PROTO_ARRAY_BLOCK,
                    root: headRoot,
                });
            }
            const headNode = this.protoArray.nodes[headIndex];
            if (headNode === undefined) {
                throw new errors_1.ForkChoiceError({
                    code: errors_1.ForkChoiceErrorCode.MISSING_PROTO_ARRAY_BLOCK,
                    root: headRoot,
                });
            }
            return (this.head = headNode);
        }
        catch (e) {
            (_d = this.metrics) === null || _d === void 0 ? void 0 : _d.forkChoiceErrors.inc();
            throw e;
        }
        finally {
            if (timer)
                timer();
        }
    }
    /** Very expensive function, iterates the entire ProtoArray. Called only in debug API */
    getHeads() {
        return this.protoArray.nodes.filter((node) => node.bestChild === undefined);
    }
    getFinalizedCheckpoint() {
        return this.fcStore.finalizedCheckpoint;
    }
    getJustifiedCheckpoint() {
        return this.fcStore.justifiedCheckpoint;
    }
    getBestJustifiedCheckpoint() {
        return this.fcStore.bestJustifiedCheckpoint;
    }
    /**
     * Add `block` to the fork choice DAG.
     *
     * ## Specification
     *
     * Approximates:
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/fork-choice.md#on_block
     *
     * It only approximates the specification since it does not run the `state_transition` check.
     * That should have already been called upstream and it's too expensive to call again.
     *
     * ## Notes:
     *
     * The supplied block **must** pass the `state_transition` function as it will not be run here.
     *
     * `justifiedBalances` balances of justified state which is updated synchronously.
     * This ensures that the forkchoice is never out of sync.
     */
    onBlock(block, state, preCachedData) {
        const { parentRoot, slot } = block;
        const parentRootHex = (0, ssz_1.toHexString)(parentRoot);
        // Parent block must be known
        if (!this.protoArray.hasBlock(parentRootHex)) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INVALID_BLOCK,
                err: {
                    code: errors_1.InvalidBlockCode.UNKNOWN_PARENT,
                    root: parentRootHex,
                },
            });
        }
        // Blocks cannot be in the future. If they are, their consideration must be delayed until
        // the are in the past.
        //
        // Note: presently, we do not delay consideration. We just drop the block.
        if (slot > this.fcStore.currentSlot) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INVALID_BLOCK,
                err: {
                    code: errors_1.InvalidBlockCode.FUTURE_SLOT,
                    currentSlot: this.fcStore.currentSlot,
                    blockSlot: slot,
                },
            });
        }
        // Check that block is later than the finalized epoch slot (optimization to reduce calls to
        // get_ancestor).
        const finalizedSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(this.fcStore.finalizedCheckpoint.epoch);
        if (slot <= finalizedSlot) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INVALID_BLOCK,
                err: {
                    code: errors_1.InvalidBlockCode.FINALIZED_SLOT,
                    finalizedSlot,
                    blockSlot: slot,
                },
            });
        }
        // Check block is a descendant of the finalized block at the checkpoint finalized slot.
        const blockAncestorRoot = this.getAncestor(parentRootHex, finalizedSlot);
        const finalizedRoot = this.fcStore.finalizedCheckpoint.rootHex;
        if (blockAncestorRoot !== finalizedRoot) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INVALID_BLOCK,
                err: {
                    code: errors_1.InvalidBlockCode.NOT_FINALIZED_DESCENDANT,
                    finalizedRoot,
                    blockAncestor: blockAncestorRoot,
                },
            });
        }
        if ((preCachedData === null || preCachedData === void 0 ? void 0 : preCachedData.isMergeTransitionBlock) ||
            (lodestar_beacon_state_transition_1.bellatrix.isBellatrixStateType(state) &&
                lodestar_beacon_state_transition_1.bellatrix.isBellatrixBlockBodyType(block.body) &&
                lodestar_beacon_state_transition_1.bellatrix.isMergeTransitionBlock(state, block.body)))
            assertValidTerminalPowBlock(this.config, block, preCachedData);
        let shouldUpdateJustified = false;
        const { finalizedCheckpoint } = state;
        const currentJustifiedCheckpoint = (0, store_1.toCheckpointWithHex)(state.currentJustifiedCheckpoint);
        const stateJustifiedEpoch = currentJustifiedCheckpoint.epoch;
        // Update justified checkpoint.
        if (stateJustifiedEpoch > this.fcStore.justifiedCheckpoint.epoch) {
            const { justifiedBalances } = preCachedData || {};
            if (!justifiedBalances) {
                throw new errors_1.ForkChoiceError({
                    code: errors_1.ForkChoiceErrorCode.UNABLE_TO_SET_JUSTIFIED_CHECKPOINT,
                    error: new Error("No validator balances supplied"),
                });
            }
            if (stateJustifiedEpoch > this.fcStore.bestJustifiedCheckpoint.epoch) {
                this.updateBestJustified(currentJustifiedCheckpoint, justifiedBalances);
            }
            if (this.shouldUpdateJustifiedCheckpoint(state)) {
                // wait to update until after finalized checkpoint is set
                shouldUpdateJustified = true;
            }
        }
        // Update finalized checkpoint.
        if (finalizedCheckpoint.epoch > this.fcStore.finalizedCheckpoint.epoch) {
            this.fcStore.finalizedCheckpoint = (0, store_1.toCheckpointWithHex)(finalizedCheckpoint);
            shouldUpdateJustified = true;
            this.synced = false;
        }
        // This needs to be performed after finalized checkpoint has been updated
        if (shouldUpdateJustified) {
            const { justifiedBalances } = preCachedData || {};
            if (!justifiedBalances) {
                throw new errors_1.ForkChoiceError({
                    code: errors_1.ForkChoiceErrorCode.UNABLE_TO_SET_JUSTIFIED_CHECKPOINT,
                    error: new Error("No validator balances supplied"),
                });
            }
            this.updateJustified(currentJustifiedCheckpoint, justifiedBalances);
        }
        const blockRoot = this.config.getForkTypes(slot).BeaconBlock.hashTreeRoot(block);
        const blockRootHex = (0, ssz_1.toHexString)(blockRoot);
        // Add proposer score boost if the block is timely
        if (this.proposerBoostEnabled && slot === this.fcStore.currentSlot) {
            const { blockDelaySec } = preCachedData || {};
            if (blockDelaySec === undefined) {
                throw Error("Missing blockDelaySec info for proposerBoost");
            }
            const proposerInterval = (0, lodestar_beacon_state_transition_1.getCurrentInterval)(this.config, state.genesisTime, blockDelaySec);
            if (proposerInterval < 1) {
                this.proposerBoostRoot = blockRootHex;
                this.synced = false;
            }
        }
        const targetSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)((0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot));
        const targetRoot = slot === targetSlot ? blockRoot : state.blockRoots[targetSlot % lodestar_params_1.SLOTS_PER_HISTORICAL_ROOT];
        // This does not apply a vote to the block, it just makes fork choice aware of the block so
        // it can still be identified as the head even if it doesn't have any votes.
        this.protoArray.onBlock({
            slot: slot,
            blockRoot: blockRootHex,
            parentRoot: parentRootHex,
            targetRoot: (0, ssz_1.toHexString)(targetRoot),
            stateRoot: (0, ssz_1.toHexString)(block.stateRoot),
            justifiedEpoch: stateJustifiedEpoch,
            justifiedRoot: (0, ssz_1.toHexString)(state.currentJustifiedCheckpoint.root),
            finalizedEpoch: finalizedCheckpoint.epoch,
            finalizedRoot: (0, ssz_1.toHexString)(state.finalizedCheckpoint.root),
            ...(lodestar_beacon_state_transition_1.bellatrix.isBellatrixBlockBodyType(block.body) &&
                lodestar_beacon_state_transition_1.bellatrix.isBellatrixStateType(state) &&
                lodestar_beacon_state_transition_1.bellatrix.isExecutionEnabled(state, block.body)
                ? {
                    executionPayloadBlockHash: (0, ssz_1.toHexString)(block.body.executionPayload.blockHash),
                    executionStatus: this.getPostMergeExecStatus(preCachedData),
                }
                : { executionPayloadBlockHash: null, executionStatus: this.getPreMergeExecStatus(preCachedData) }),
        });
    }
    /**
     * Register `attestation` with the fork choice DAG so that it may influence future calls to `getHead`.
     *
     * ## Specification
     *
     * Approximates:
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/fork-choice.md#on_attestation
     *
     * It only approximates the specification since it does not perform
     * `is_valid_indexed_attestation` since that should already have been called upstream and it's
     * too expensive to call again.
     *
     * ## Notes:
     *
     * The supplied `attestation` **must** pass the `in_valid_indexed_attestation` function as it
     * will not be run here.
     */
    onAttestation(attestation) {
        // Ignore any attestations to the zero hash.
        //
        // This is an edge case that results from the spec aliasing the zero hash to the genesis
        // block. Attesters may attest to the zero hash if they have never seen a block.
        //
        // We have two options here:
        //
        //  1. Apply all zero-hash attestations to the genesis block.
        //  2. Ignore all attestations to the zero hash.
        //
        // (1) becomes weird once we hit finality and fork choice drops the genesis block. (2) is
        // fine because votes to the genesis block are not useful; all validators implicitly attest
        // to genesis just by being present in the chain.
        const attestationData = attestation.data;
        const { slot, beaconBlockRoot } = attestationData;
        const blockRootHex = (0, ssz_1.toHexString)(beaconBlockRoot);
        const targetEpoch = attestationData.target.epoch;
        if (lodestar_types_1.ssz.Root.equals(beaconBlockRoot, lodestar_beacon_state_transition_1.ZERO_HASH)) {
            return;
        }
        this.validateOnAttestation(attestation, slot, blockRootHex, targetEpoch);
        if (slot < this.fcStore.currentSlot) {
            for (const validatorIndex of (0, ssz_1.readonlyValues)(attestation.attestingIndices)) {
                this.addLatestMessage(validatorIndex, targetEpoch, blockRootHex);
            }
        }
        else {
            // The spec declares:
            //
            // ```
            // Attestations can only affect the fork choice of subsequent slots.
            // Delay consideration in the fork choice until their slot is in the past.
            // ```
            this.queuedAttestations.add({
                slot: slot,
                attestingIndices: Array.from((0, ssz_1.readonlyValues)(attestation.attestingIndices)),
                blockRoot: blockRootHex,
                targetEpoch,
            });
        }
    }
    getLatestMessage(validatorIndex) {
        const vote = this.votes[validatorIndex];
        if (vote === undefined) {
            return undefined;
        }
        return {
            epoch: vote.nextEpoch,
            root: vote.nextRoot,
        };
    }
    /**
     * Call `onTick` for all slots between `fcStore.getCurrentSlot()` and the provided `currentSlot`.
     */
    updateTime(currentSlot) {
        while (this.fcStore.currentSlot < currentSlot) {
            const previousSlot = this.fcStore.currentSlot;
            // Note: we are relying upon `onTick` to update `fcStore.time` to ensure we don't get stuck in a loop.
            this.onTick(previousSlot + 1);
        }
        // Process any attestations that might now be eligible.
        this.processAttestationQueue();
        this.validatedAttestationDatas = new Set();
    }
    getTime() {
        return this.fcStore.currentSlot;
    }
    /** Returns `true` if the block is known **and** a descendant of the finalized root. */
    hasBlock(blockRoot) {
        return this.hasBlockHex((0, ssz_1.toHexString)(blockRoot));
    }
    /** Returns a `IProtoBlock` if the block is known **and** a descendant of the finalized root. */
    getBlock(blockRoot) {
        return this.getBlockHex((0, ssz_1.toHexString)(blockRoot));
    }
    /**
     * Returns `true` if the block is known **and** a descendant of the finalized root.
     */
    hasBlockHex(blockRoot) {
        return this.protoArray.hasBlock(blockRoot) && this.isDescendantOfFinalized(blockRoot);
    }
    /**
     * Returns a `IProtoBlock` if the block is known **and** a descendant of the finalized root.
     */
    getBlockHex(blockRoot) {
        const block = this.protoArray.getBlock(blockRoot);
        if (!block) {
            return null;
        }
        // If available, use the parent_root to perform the lookup since it will involve one
        // less lookup. This involves making the assumption that the finalized block will
        // always have `block.parent_root` of `None`.
        if (!this.isDescendantOfFinalized(blockRoot)) {
            return null;
        }
        return block;
    }
    getJustifiedBlock() {
        const block = this.getBlockHex(this.fcStore.justifiedCheckpoint.rootHex);
        if (!block) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.MISSING_PROTO_ARRAY_BLOCK,
                root: this.fcStore.justifiedCheckpoint.rootHex,
            });
        }
        return block;
    }
    getFinalizedBlock() {
        const block = this.getBlockHex(this.fcStore.finalizedCheckpoint.rootHex);
        if (!block) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.MISSING_PROTO_ARRAY_BLOCK,
                root: this.fcStore.finalizedCheckpoint.rootHex,
            });
        }
        return block;
    }
    /**
     * Return `true` if `block_root` is equal to the finalized root, or a known descendant of it.
     */
    isDescendantOfFinalized(blockRoot) {
        return this.protoArray.isDescendant(this.fcStore.finalizedCheckpoint.rootHex, blockRoot);
    }
    /**
     * Returns true if the `descendantRoot` has an ancestor with `ancestorRoot`.
     *
     * Always returns `false` if either input roots are unknown.
     * Still returns `true` if `ancestorRoot===descendantRoot` (and the roots are known)
     */
    isDescendant(ancestorRoot, descendantRoot) {
        return this.protoArray.isDescendant(ancestorRoot, descendantRoot);
    }
    prune(finalizedRoot) {
        return this.protoArray.maybePrune(finalizedRoot);
    }
    setPruneThreshold(threshold) {
        this.protoArray.pruneThreshold = threshold;
    }
    /**
     * Iterates backwards through block summaries, starting from a block root.
     * Return only the non-finalized blocks.
     */
    iterateAncestorBlocks(blockRoot) {
        return this.protoArray.iterateAncestorNodes(blockRoot);
    }
    /**
     * Returns all blocks backwards starting from a block root.
     * Return only the non-finalized blocks.
     */
    getAllAncestorBlocks(blockRoot) {
        const blocks = this.protoArray.getAllAncestorNodes(blockRoot);
        // the last node is the previous finalized one, it's there to check onBlock finalized checkpoint only.
        return blocks.slice(0, blocks.length - 1);
    }
    /**
     * The same to iterateAncestorBlocks but this gets non-ancestor nodes instead of ancestor nodes.
     */
    getAllNonAncestorBlocks(blockRoot) {
        return this.protoArray.getAllNonAncestorNodes(blockRoot);
    }
    getCanonicalBlockAtSlot(slot) {
        if (slot > this.head.slot) {
            return null;
        }
        if (slot === this.head.slot) {
            return this.head;
        }
        for (const block of this.protoArray.iterateAncestorNodes(this.head.blockRoot)) {
            if (block.slot === slot) {
                return block;
            }
        }
        return null;
    }
    /** Very expensive function, iterates the entire ProtoArray. TODO: Is this function even necessary? */
    forwarditerateAncestorBlocks() {
        return this.protoArray.nodes;
    }
    /** Very expensive function, iterates the entire ProtoArray. TODO: Is this function even necessary? */
    getBlockSummariesByParentRoot(parentRoot) {
        return this.protoArray.nodes.filter((node) => node.parentRoot === parentRoot);
    }
    /** Very expensive function, iterates the entire ProtoArray. TODO: Is this function even necessary? */
    getBlockSummariesAtSlot(slot) {
        const nodes = this.protoArray.nodes;
        const blocksAtSlot = [];
        for (let i = 0, len = nodes.length; i < len; i++) {
            const node = nodes[i];
            if (node.slot === slot) {
                blocksAtSlot.push(node);
            }
        }
        return blocksAtSlot;
    }
    /** Returns the distance of common ancestor of nodes to newNode. Returns null if newNode is descendant of prevNode */
    getCommonAncestorDistance(prevBlock, newBlock) {
        const prevNode = this.protoArray.getNode(prevBlock.blockRoot);
        const newNode = this.protoArray.getNode(newBlock.blockRoot);
        if (!prevNode)
            throw Error(`No node if forkChoice for blockRoot ${prevBlock.blockRoot}`);
        if (!newNode)
            throw Error(`No node if forkChoice for blockRoot ${newBlock.blockRoot}`);
        const commonAncestor = this.protoArray.getCommonAncestor(prevNode, newNode);
        // No common ancestor, should never happen. Return null to not throw
        if (!commonAncestor)
            return null;
        // If common node is one of both nodes, then they are direct descendants, return null
        if (commonAncestor.blockRoot === prevNode.blockRoot || commonAncestor.blockRoot === newNode.blockRoot) {
            return null;
        }
        return newNode.slot - commonAncestor.slot;
    }
    /**
     * Optimistic sync validate till validated latest hash, invalidate any decendant branch if invalidate till hash provided
     * TODO: implementation:
     * 1. verify is_merge_block if the mergeblock has not yet been validated
     * 2. Throw critical error and exit if a block in finalized chain gets invalidated
     */
    validateLatestHash(_latestValidHash, _invalidateTillHash) {
        // Silently ignore for now if all calls were valid
        return;
    }
    getPreMergeExecStatus(preCachedData) {
        const executionStatus = (preCachedData === null || preCachedData === void 0 ? void 0 : preCachedData.executionStatus) || interface_1.ExecutionStatus.PreMerge;
        if (executionStatus !== interface_1.ExecutionStatus.PreMerge)
            throw Error(`Invalid pre-merge execution status: expected: ${interface_1.ExecutionStatus.PreMerge}, got ${executionStatus}`);
        return executionStatus;
    }
    getPostMergeExecStatus(preCachedData) {
        const executionStatus = (preCachedData === null || preCachedData === void 0 ? void 0 : preCachedData.executionStatus) || interface_1.ExecutionStatus.Syncing;
        if (executionStatus === interface_1.ExecutionStatus.PreMerge)
            throw Error(`Invalid post-merge execution status: expected: ${interface_1.ExecutionStatus.Syncing} or ${interface_1.ExecutionStatus.Valid} , got ${executionStatus}`);
        return executionStatus;
    }
    updateJustified(justifiedCheckpoint, justifiedBalances) {
        this.synced = false;
        this.justifiedBalances = justifiedBalances;
        this.justifiedProposerBoostScore = null;
        this.fcStore.justifiedCheckpoint = justifiedCheckpoint;
    }
    updateBestJustified(justifiedCheckpoint, justifiedBalances) {
        this.bestJustifiedBalances = justifiedBalances;
        this.fcStore.bestJustifiedCheckpoint = justifiedCheckpoint;
    }
    /**
     * Returns `true` if the given `store` should be updated to set
     * `state.current_justified_checkpoint` its `justified_checkpoint`.
     *
     * ## Specification
     *
     * Is equivalent to:
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/fork-choice.md#should_update_justified_checkpoint
     */
    shouldUpdateJustifiedCheckpoint(state) {
        const { slot, currentJustifiedCheckpoint } = state;
        const newJustifiedCheckpoint = currentJustifiedCheckpoint;
        if ((0, lodestar_beacon_state_transition_1.computeSlotsSinceEpochStart)(this.fcStore.currentSlot) < lodestar_params_1.SAFE_SLOTS_TO_UPDATE_JUSTIFIED) {
            return true;
        }
        const justifiedSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(this.fcStore.justifiedCheckpoint.epoch);
        // This sanity check is not in the spec, but the invariant is implied
        if (justifiedSlot >= slot) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.ATTEMPT_TO_REVERT_JUSTIFICATION,
                store: justifiedSlot,
                state: slot,
            });
        }
        // at regular sync time we don't want to wait for clock time next epoch to update bestJustifiedCheckpoint
        if ((0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot) < (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(this.fcStore.currentSlot)) {
            return true;
        }
        // We know that the slot for `new_justified_checkpoint.root` is not greater than
        // `state.slot`, since a state cannot justify its own slot.
        //
        // We know that `new_justified_checkpoint.root` is an ancestor of `state`, since a `state`
        // only ever justifies ancestors.
        //
        // A prior `if` statement protects against a justified_slot that is greater than
        // `state.slot`
        const justifiedAncestor = this.getAncestor((0, ssz_1.toHexString)(newJustifiedCheckpoint.root), justifiedSlot);
        if (justifiedAncestor !== this.fcStore.justifiedCheckpoint.rootHex) {
            return false;
        }
        return true;
    }
    /**
     * Validates the `indexed_attestation` for application to fork choice.
     *
     * ## Specification
     *
     * Equivalent to:
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/fork-choice.md#validate_on_attestation
     */
    validateOnAttestation(indexedAttestation, slot, blockRootHex, targetEpoch) {
        // There is no point in processing an attestation with an empty bitfield. Reject
        // it immediately.
        //
        // This is not in the specification, however it should be transparent to other nodes. We
        // return early here to avoid wasting precious resources verifying the rest of it.
        if (!indexedAttestation.attestingIndices.length) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INVALID_ATTESTATION,
                err: {
                    code: errors_1.InvalidAttestationCode.EMPTY_AGGREGATION_BITFIELD,
                },
            });
        }
        const attestationData = indexedAttestation.data;
        // Only cache attestation data root hex if it's tree backed since it's available.
        if ((0, ssz_1.isTreeBacked)(attestationData) &&
            this.validatedAttestationDatas.has((0, ssz_1.toHexString)(attestationData.tree.root))) {
            return;
        }
        this.validateAttestationData(indexedAttestation.data, slot, blockRootHex, targetEpoch);
    }
    validateAttestationData(attestationData, slot, beaconBlockRootHex, targetEpoch) {
        const epochNow = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(this.fcStore.currentSlot);
        const targetRootHex = (0, ssz_1.toHexString)(attestationData.target.root);
        // Attestation must be from the current of previous epoch.
        if (targetEpoch > epochNow) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INVALID_ATTESTATION,
                err: {
                    code: errors_1.InvalidAttestationCode.FUTURE_EPOCH,
                    attestationEpoch: targetEpoch,
                    currentEpoch: epochNow,
                },
            });
        }
        else if (targetEpoch + 1 < epochNow) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INVALID_ATTESTATION,
                err: {
                    code: errors_1.InvalidAttestationCode.PAST_EPOCH,
                    attestationEpoch: targetEpoch,
                    currentEpoch: epochNow,
                },
            });
        }
        if (targetEpoch !== (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot)) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INVALID_ATTESTATION,
                err: {
                    code: errors_1.InvalidAttestationCode.BAD_TARGET_EPOCH,
                    target: targetEpoch,
                    slot,
                },
            });
        }
        // Attestation target must be for a known block.
        //
        // We do not delay the block for later processing to reduce complexity and DoS attack
        // surface.
        if (!this.protoArray.hasBlock(targetRootHex)) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INVALID_ATTESTATION,
                err: {
                    code: errors_1.InvalidAttestationCode.UNKNOWN_TARGET_ROOT,
                    root: targetRootHex,
                },
            });
        }
        // Load the block for `attestation.data.beacon_block_root`.
        //
        // This indirectly checks to see if the `attestation.data.beacon_block_root` is in our fork
        // choice. Any known, non-finalized block should be in fork choice, so this check
        // immediately filters out attestations that attest to a block that has not been processed.
        //
        // Attestations must be for a known block. If the block is unknown, we simply drop the
        // attestation and do not delay consideration for later.
        const block = this.protoArray.getBlock(beaconBlockRootHex);
        if (!block) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INVALID_ATTESTATION,
                err: {
                    code: errors_1.InvalidAttestationCode.UNKNOWN_HEAD_BLOCK,
                    beaconBlockRoot: beaconBlockRootHex,
                },
            });
        }
        // If an attestation points to a block that is from an earlier slot than the attestation,
        // then all slots between the block and attestation must be skipped. Therefore if the block
        // is from a prior epoch to the attestation, then the target root must be equal to the root
        // of the block that is being attested to.
        const expectedTargetHex = targetEpoch > (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(block.slot) ? beaconBlockRootHex : block.targetRoot;
        if (expectedTargetHex !== targetRootHex) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INVALID_ATTESTATION,
                err: {
                    code: errors_1.InvalidAttestationCode.INVALID_TARGET,
                    attestation: targetRootHex,
                    local: expectedTargetHex,
                },
            });
        }
        // Attestations must not be for blocks in the future. If this is the case, the attestation
        // should not be considered.
        if (block.slot > slot) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INVALID_ATTESTATION,
                err: {
                    code: errors_1.InvalidAttestationCode.ATTESTS_TO_FUTURE_BLOCK,
                    block: block.slot,
                    attestation: slot,
                },
            });
        }
        // Only cache attestation data root hex if it's tree backed since it's available.
        if ((0, ssz_1.isTreeBacked)(attestationData)) {
            this.validatedAttestationDatas.add((0, ssz_1.toHexString)(attestationData.tree.root));
        }
    }
    /**
     * Add a validator's latest message to the tracked votes
     */
    addLatestMessage(validatorIndex, nextEpoch, nextRoot) {
        this.synced = false;
        const vote = this.votes[validatorIndex];
        if (vote === undefined) {
            this.votes[validatorIndex] = {
                currentRoot: interface_1.HEX_ZERO_HASH,
                nextRoot,
                nextEpoch,
            };
        }
        else if (nextEpoch > vote.nextEpoch) {
            vote.nextRoot = nextRoot;
            vote.nextEpoch = nextEpoch;
        }
        // else its an old vote, don't count it
    }
    /**
     * Processes and removes from the queue any queued attestations which may now be eligible for
     * processing due to the slot clock incrementing.
     */
    processAttestationQueue() {
        const currentSlot = this.fcStore.currentSlot;
        for (const attestation of this.queuedAttestations.values()) {
            if (attestation.slot <= currentSlot) {
                this.queuedAttestations.delete(attestation);
                const { blockRoot, targetEpoch } = attestation;
                const blockRootHex = blockRoot;
                for (const validatorIndex of attestation.attestingIndices) {
                    this.addLatestMessage(validatorIndex, targetEpoch, blockRootHex);
                }
            }
        }
    }
    /**
     * Called whenever the current time increases.
     *
     * ## Specification
     *
     * Equivalent to:
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/fork-choice.md#on_tick
     */
    onTick(time) {
        const previousSlot = this.fcStore.currentSlot;
        if (time > previousSlot + 1) {
            throw new errors_1.ForkChoiceError({
                code: errors_1.ForkChoiceErrorCode.INCONSISTENT_ON_TICK,
                previousSlot,
                time,
            });
        }
        // Update store time
        this.fcStore.currentSlot = time;
        if (this.proposerBoostRoot) {
            // Since previous weight was boosted, we need would now need to recalculate the
            // scores but without the boost
            this.proposerBoostRoot = null;
            this.synced = false;
        }
        const currentSlot = time;
        if ((0, lodestar_beacon_state_transition_1.computeSlotsSinceEpochStart)(currentSlot) !== 0) {
            return;
        }
        const { bestJustifiedCheckpoint, justifiedCheckpoint, finalizedCheckpoint } = this.fcStore;
        // Update store.justified_checkpoint if a better checkpoint on the store.finalized_checkpoint chain
        if (bestJustifiedCheckpoint.epoch > justifiedCheckpoint.epoch) {
            const finalizedSlot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(finalizedCheckpoint.epoch);
            const ancestorAtFinalizedSlot = this.getAncestor(bestJustifiedCheckpoint.rootHex, finalizedSlot);
            if (ancestorAtFinalizedSlot === finalizedCheckpoint.rootHex) {
                this.updateJustified(this.fcStore.bestJustifiedCheckpoint, this.bestJustifiedBalances);
            }
        }
    }
}
exports.ForkChoice = ForkChoice;
function assertValidTerminalPowBlock(config, block, preCachedData) {
    if (!lodestar_types_1.ssz.Root.equals(config.TERMINAL_BLOCK_HASH, lodestar_beacon_state_transition_1.ZERO_HASH)) {
        if ((0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(block.slot) < config.TERMINAL_BLOCK_HASH_ACTIVATION_EPOCH)
            throw Error(`Terminal block activation epoch ${config.TERMINAL_BLOCK_HASH_ACTIVATION_EPOCH} not reached`);
        // powBock.blockhash is hex, so we just pick the corresponding root
        if (!lodestar_types_1.ssz.Root.equals(block.body.executionPayload.parentHash, config.TERMINAL_BLOCK_HASH))
            throw new Error(`Invalid terminal block hash, expected: ${(0, ssz_1.toHexString)(config.TERMINAL_BLOCK_HASH)}, actual: ${(0, ssz_1.toHexString)(block.body.executionPayload.parentHash)}`);
    }
    else {
        // If no TERMINAL_BLOCK_HASH override, check ttd
        // Delay powBlock checks if the payload execution status is unknown because of
        // syncing response in notifyNewPayload call while verifying
        if ((preCachedData === null || preCachedData === void 0 ? void 0 : preCachedData.executionStatus) === interface_1.ExecutionStatus.Syncing)
            return;
        const { powBlock, powBlockParent } = preCachedData || {};
        if (!powBlock)
            throw Error("onBlock preCachedData must include powBlock");
        if (!powBlockParent)
            throw Error("onBlock preCachedData must include powBlock");
        const isTotalDifficultyReached = powBlock.totalDifficulty >= config.TERMINAL_TOTAL_DIFFICULTY;
        const isParentTotalDifficultyValid = powBlockParent.totalDifficulty < config.TERMINAL_TOTAL_DIFFICULTY;
        if (!isTotalDifficultyReached || !isParentTotalDifficultyValid)
            throw Error(`Invalid terminal POW block: total difficulty not reached ${powBlockParent.totalDifficulty} < ${powBlock.totalDifficulty}`);
    }
}
function computeProposerBoostScore({ justifiedTotalActiveBalanceByIncrement, justifiedActiveValidators, }, config) {
    const avgBalanceByIncrement = Math.floor(justifiedTotalActiveBalanceByIncrement / justifiedActiveValidators);
    const committeeSize = Math.floor(justifiedActiveValidators / config.slotsPerEpoch);
    const committeeWeight = committeeSize * avgBalanceByIncrement;
    const proposerScore = Math.floor((committeeWeight * config.proposerScoreBoost) / 100);
    return proposerScore;
}
function computeProposerBoostScoreFromBalances(justifiedBalances, config) {
    let justifiedTotalActiveBalanceByIncrement = 0, justifiedActiveValidators = 0;
    for (let i = 0; i < justifiedBalances.length; i++) {
        if (justifiedBalances[i] > 0) {
            justifiedActiveValidators += 1;
            // justified balances here are by increment
            justifiedTotalActiveBalanceByIncrement += justifiedBalances[i];
        }
    }
    return computeProposerBoostScore({ justifiedTotalActiveBalanceByIncrement, justifiedActiveValidators }, config);
}
exports.computeProposerBoostScoreFromBalances = computeProposerBoostScoreFromBalances;
//# sourceMappingURL=forkChoice.js.map