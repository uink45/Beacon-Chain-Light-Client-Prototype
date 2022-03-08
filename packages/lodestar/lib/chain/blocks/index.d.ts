import { AbortSignal } from "@chainsafe/abort-controller";
import { JobItemQueue } from "../../util/queue";
import { VerifyBlockModules } from "./verifyBlock";
import { ImportBlockModules } from "./importBlock";
import { BlockProcessOpts } from "../options";
import { PartiallyVerifiedBlock } from "./types";
export { PartiallyVerifiedBlockFlags } from "./types";
export declare type ProcessBlockModules = VerifyBlockModules & ImportBlockModules;
/**
 * BlockProcessor processes block jobs in a queued fashion, one after the other.
 */
export declare class BlockProcessor {
    readonly jobQueue: JobItemQueue<[PartiallyVerifiedBlock[] | PartiallyVerifiedBlock], void>;
    constructor(modules: ProcessBlockModules, opts: BlockProcessOpts, signal: AbortSignal);
    processBlockJob(job: PartiallyVerifiedBlock): Promise<void>;
    processChainSegment(job: PartiallyVerifiedBlock[]): Promise<void>;
}
/**
 * Validate and process a block
 *
 * The only effects of running this are:
 * - forkChoice update, in the case of a valid block
 * - various events emitted: checkpoint, forkChoice:*, head, block, error:block
 * - (state cache update, from state regeneration)
 *
 * All other effects are provided by downstream event handlers
 */
export declare function processBlock(modules: ProcessBlockModules, partiallyVerifiedBlock: PartiallyVerifiedBlock, opts: BlockProcessOpts): Promise<void>;
/**
 * Similar to processBlockJob but this process a chain segment
 */
export declare function processChainSegment(modules: ProcessBlockModules, partiallyVerifiedBlocks: PartiallyVerifiedBlock[], opts: BlockProcessOpts): Promise<void>;
//# sourceMappingURL=index.d.ts.map