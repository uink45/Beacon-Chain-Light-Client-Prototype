import { Root, phase0, allForks } from "@chainsafe/lodestar-types";
import { TreeBacked, List } from "@chainsafe/ssz";
import { IFilterOptions } from "@chainsafe/lodestar-db";
export declare type DepositGetter<T> = (indexRange: IFilterOptions<number>, eth1Data: phase0.Eth1Data) => Promise<T[]>;
export declare function getDeposits<T>(state: allForks.BeaconState, eth1Data: phase0.Eth1Data, depositsGetter: DepositGetter<T>): Promise<T[]>;
export declare function getDepositsWithProofs(depositEvents: phase0.DepositEvent[], depositRootTree: TreeBacked<List<Root>>, eth1Data: phase0.Eth1Data): phase0.Deposit[];
//# sourceMappingURL=deposits.d.ts.map