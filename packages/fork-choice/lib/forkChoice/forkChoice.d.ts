import { Slot, ValidatorIndex, phase0, allForks, RootHex, Root } from "@chainsafe/lodestar-types";
import { EffectiveBalanceIncrements } from "@chainsafe/lodestar-beacon-state-transition";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { IProtoBlock } from "../protoArray/interface";
import { ProtoArray } from "../protoArray/protoArray";
import { IForkChoiceMetrics } from "../metrics";
import { IForkChoice, ILatestMessage, OnBlockPrecachedData } from "./interface";
import { IForkChoiceStore, CheckpointWithHex } from "./store";
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
export declare class ForkChoice implements IForkChoice {
    private readonly config;
    private readonly fcStore;
    /** The underlying representation of the block DAG. */
    private readonly protoArray;
    /**
     * Balances currently tracked in the protoArray
     * Indexed by validator index
     *
     * This should be the balances of the state at fcStore.justifiedCheckpoint
     */
    private justifiedBalances;
    private readonly proposerBoostEnabled;
    private readonly metrics?;
    /**
     * Votes currently tracked in the protoArray
     * Indexed by validator index
     * Each vote contains the latest message and previous message
     */
    private readonly votes;
    /**
     * Attestations that arrived at the current slot and must be queued for later processing.
     * NOT currently tracked in the protoArray
     */
    private readonly queuedAttestations;
    /**
     * Balances tracked in the protoArray, or soon to be tracked
     * Indexed by validator index
     *
     * This should be the balances of the state at fcStore.bestJustifiedCheckpoint
     */
    private bestJustifiedBalances;
    /** Avoid having to compute detas all the times. */
    private synced;
    /** Cached head */
    private head;
    /**
     * Only cache attestation data root hex if it's tree backed since it's available.
     **/
    private validatedAttestationDatas;
    /** Boost the entire branch with this proposer root as the leaf */
    private proposerBoostRoot;
    /** Score to use in proposer boost, evaluated lazily from justified balances */
    private justifiedProposerBoostScore;
    /**
     * Instantiates a Fork Choice from some existing components
     *
     * This is useful if the existing components have been loaded from disk after a process restart.
     */
    constructor(config: IChainForkConfig, fcStore: IForkChoiceStore, 
    /** The underlying representation of the block DAG. */
    protoArray: ProtoArray, 
    /**
     * Balances currently tracked in the protoArray
     * Indexed by validator index
     *
     * This should be the balances of the state at fcStore.justifiedCheckpoint
     */
    justifiedBalances: EffectiveBalanceIncrements, proposerBoostEnabled: boolean, metrics?: IForkChoiceMetrics | null | undefined);
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
    getAncestor(blockRoot: RootHex, ancestorSlot: Slot): RootHex;
    /**
     * Get the cached head root
     */
    getHeadRoot(): RootHex;
    /**
     * Get the cached head
     */
    getHead(): IProtoBlock;
    /**
     * Get the proposer boost root
     */
    getProposerBoostRoot(): RootHex;
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
    updateHead(): IProtoBlock;
    /** Very expensive function, iterates the entire ProtoArray. Called only in debug API */
    getHeads(): IProtoBlock[];
    getFinalizedCheckpoint(): CheckpointWithHex;
    getJustifiedCheckpoint(): CheckpointWithHex;
    getBestJustifiedCheckpoint(): CheckpointWithHex;
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
    onBlock(block: allForks.BeaconBlock, state: allForks.BeaconState, preCachedData?: OnBlockPrecachedData): void;
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
    onAttestation(attestation: phase0.IndexedAttestation): void;
    getLatestMessage(validatorIndex: ValidatorIndex): ILatestMessage | undefined;
    /**
     * Call `onTick` for all slots between `fcStore.getCurrentSlot()` and the provided `currentSlot`.
     */
    updateTime(currentSlot: Slot): void;
    getTime(): Slot;
    /** Returns `true` if the block is known **and** a descendant of the finalized root. */
    hasBlock(blockRoot: Root): boolean;
    /** Returns a `IProtoBlock` if the block is known **and** a descendant of the finalized root. */
    getBlock(blockRoot: Root): IProtoBlock | null;
    /**
     * Returns `true` if the block is known **and** a descendant of the finalized root.
     */
    hasBlockHex(blockRoot: RootHex): boolean;
    /**
     * Returns a `IProtoBlock` if the block is known **and** a descendant of the finalized root.
     */
    getBlockHex(blockRoot: RootHex): IProtoBlock | null;
    getJustifiedBlock(): IProtoBlock;
    getFinalizedBlock(): IProtoBlock;
    /**
     * Return `true` if `block_root` is equal to the finalized root, or a known descendant of it.
     */
    isDescendantOfFinalized(blockRoot: RootHex): boolean;
    /**
     * Returns true if the `descendantRoot` has an ancestor with `ancestorRoot`.
     *
     * Always returns `false` if either input roots are unknown.
     * Still returns `true` if `ancestorRoot===descendantRoot` (and the roots are known)
     */
    isDescendant(ancestorRoot: RootHex, descendantRoot: RootHex): boolean;
    prune(finalizedRoot: RootHex): IProtoBlock[];
    setPruneThreshold(threshold: number): void;
    /**
     * Iterates backwards through block summaries, starting from a block root.
     * Return only the non-finalized blocks.
     */
    iterateAncestorBlocks(blockRoot: RootHex): IterableIterator<IProtoBlock>;
    /**
     * Returns all blocks backwards starting from a block root.
     * Return only the non-finalized blocks.
     */
    getAllAncestorBlocks(blockRoot: RootHex): IProtoBlock[];
    /**
     * The same to iterateAncestorBlocks but this gets non-ancestor nodes instead of ancestor nodes.
     */
    getAllNonAncestorBlocks(blockRoot: RootHex): IProtoBlock[];
    getCanonicalBlockAtSlot(slot: Slot): IProtoBlock | null;
    /** Very expensive function, iterates the entire ProtoArray. TODO: Is this function even necessary? */
    forwarditerateAncestorBlocks(): IProtoBlock[];
    /** Very expensive function, iterates the entire ProtoArray. TODO: Is this function even necessary? */
    getBlockSummariesByParentRoot(parentRoot: RootHex): IProtoBlock[];
    /** Very expensive function, iterates the entire ProtoArray. TODO: Is this function even necessary? */
    getBlockSummariesAtSlot(slot: Slot): IProtoBlock[];
    /** Returns the distance of common ancestor of nodes to newNode. Returns null if newNode is descendant of prevNode */
    getCommonAncestorDistance(prevBlock: IProtoBlock, newBlock: IProtoBlock): number | null;
    /**
     * Optimistic sync validate till validated latest hash, invalidate any decendant branch if invalidate till hash provided
     * TODO: implementation:
     * 1. verify is_merge_block if the mergeblock has not yet been validated
     * 2. Throw critical error and exit if a block in finalized chain gets invalidated
     */
    validateLatestHash(_latestValidHash: RootHex, _invalidateTillHash: RootHex | null): void;
    private getPreMergeExecStatus;
    private getPostMergeExecStatus;
    private updateJustified;
    private updateBestJustified;
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
    private shouldUpdateJustifiedCheckpoint;
    /**
     * Validates the `indexed_attestation` for application to fork choice.
     *
     * ## Specification
     *
     * Equivalent to:
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/fork-choice.md#validate_on_attestation
     */
    private validateOnAttestation;
    private validateAttestationData;
    /**
     * Add a validator's latest message to the tracked votes
     */
    private addLatestMessage;
    /**
     * Processes and removes from the queue any queued attestations which may now be eligible for
     * processing due to the slot clock incrementing.
     */
    private processAttestationQueue;
    /**
     * Called whenever the current time increases.
     *
     * ## Specification
     *
     * Equivalent to:
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/fork-choice.md#on_tick
     */
    private onTick;
}
export declare function computeProposerBoostScoreFromBalances(justifiedBalances: EffectiveBalanceIncrements, config: {
    slotsPerEpoch: number;
    proposerScoreBoost: number;
}): number;
//# sourceMappingURL=forkChoice.d.ts.map