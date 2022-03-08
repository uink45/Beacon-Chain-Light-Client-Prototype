/// <reference types="node" />
import { List, TreeBacked } from "@chainsafe/ssz";
import { allForks, Bytes32, Number64, phase0, Root } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
export declare const INTEROP_BLOCK_HASH: Buffer;
export declare const INTEROP_TIMESTAMP: number;
export declare type InteropStateOpts = {
    genesisTime?: number;
    eth1BlockHash?: Bytes32;
    eth1Timestamp?: Number64;
};
export declare function getInteropState(config: IChainForkConfig, { genesisTime, eth1BlockHash, eth1Timestamp, }: InteropStateOpts, deposits: phase0.Deposit[], fullDepositDataRootList?: TreeBacked<List<Root>>): TreeBacked<allForks.BeaconState>;
//# sourceMappingURL=state.d.ts.map