import { Root, phase0 } from "@chainsafe/lodestar-types";
import { List, TreeBacked } from "@chainsafe/ssz";
import { Eth1Block } from "../interface";
declare type BlockNumber = number;
/**
 * Appends partial eth1 data (depositRoot, depositCount) in a sequence of blocks
 * eth1 data deposit is inferred from sparse eth1 data obtained from the deposit logs
 */
export declare function getEth1DataForBlocks(blocks: Eth1Block[], depositDescendingStream: AsyncIterable<phase0.DepositEvent>, depositRootTree: TreeBacked<List<Root>>, lastProcessedDepositBlockNumber: BlockNumber | null): Promise<(phase0.Eth1Data & Eth1Block)[]>;
/**
 * Collect depositCount by blockNumber from a stream matching a block number range
 * For a given blockNumber it's depositCount is equal to the index + 1 of the
 * closest deposit event whose deposit.blockNumber <= blockNumber
 * @returns array ascending by blockNumber
 */
export declare function getDepositsByBlockNumber(fromBlock: BlockNumber, toBlock: BlockNumber, depositEventDescendingStream: AsyncIterable<phase0.DepositEvent>): Promise<phase0.DepositEvent[]>;
/**
 * Precompute a map of depositCount => depositRoot from a depositRootTree filled beforehand
 */
export declare function getDepositRootByDepositCount(depositCounts: number[], depositRootTree: TreeBacked<List<Root>>): Map<number, Root>;
export {};
//# sourceMappingURL=eth1Data.d.ts.map