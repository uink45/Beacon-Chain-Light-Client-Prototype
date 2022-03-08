import { CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { IForkChoice, IProtoBlock, ExecutionStatus } from "@chainsafe/lodestar-fork-choice";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IMetrics } from "../../metrics";
import { IExecutionEngine } from "../../executionEngine";
import { IBeaconClock } from "../clock";
import { BlockProcessOpts } from "../options";
import { IStateRegenerator } from "../regen";
import { IBlsVerifier } from "../bls";
import { FullyVerifiedBlock, PartiallyVerifiedBlock } from "./types";
export declare type VerifyBlockModules = {
    bls: IBlsVerifier;
    executionEngine: IExecutionEngine;
    regen: IStateRegenerator;
    clock: IBeaconClock;
    logger: ILogger;
    forkChoice: IForkChoice;
    config: IChainForkConfig;
    metrics: IMetrics | null;
};
/**
 * Fully verify a block to be imported immediately after. Does not produce any side-effects besides adding intermediate
 * states in the state cache through regen.
 */
export declare function verifyBlock(chain: VerifyBlockModules, partiallyVerifiedBlock: PartiallyVerifiedBlock, opts: BlockProcessOpts): Promise<FullyVerifiedBlock>;
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
export declare function verifyBlockSanityChecks(chain: VerifyBlockModules, partiallyVerifiedBlock: PartiallyVerifiedBlock): IProtoBlock;
/**
 * Verifies a block is fully valid running the full state transition. To relieve the main thread signatures are
 * verified separately in workers with chain.bls worker pool.
 *
 * - Advance state to block's slot - per_slot_processing()
 * - STFN - per_block_processing()
 * - Check state root matches
 */
export declare function verifyBlockStateTransition(chain: VerifyBlockModules, partiallyVerifiedBlock: PartiallyVerifiedBlock, opts: BlockProcessOpts): Promise<{
    postState: CachedBeaconStateAllForks;
    executionStatus: ExecutionStatus;
}>;
//# sourceMappingURL=verifyBlock.d.ts.map