import { IBeaconConfig, IChainForkConfig } from "@chainsafe/lodestar-config";
import { allForks } from "@chainsafe/lodestar-types";
import { InteropStateOpts } from "./interop/state";
import { IBeaconDb } from "../../db";
import { TreeBacked } from "@chainsafe/ssz";
export declare function initDevState(config: IChainForkConfig, db: IBeaconDb, validatorCount: number, interopStateOpts: InteropStateOpts): Promise<TreeBacked<allForks.BeaconState>>;
export declare function storeSSZState(config: IBeaconConfig, state: TreeBacked<allForks.BeaconState>, path: string): void;
//# sourceMappingURL=state.d.ts.map