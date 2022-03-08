import { TreeBacked, List } from "@chainsafe/ssz";
import { phase0, Root } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
/**
 * Compute and return deposit data from other validators.
 */
export declare function interopDeposits(config: IChainForkConfig, depositDataRootList: TreeBacked<List<Root>>, validatorCount: number): phase0.Deposit[];
//# sourceMappingURL=deposits.d.ts.map