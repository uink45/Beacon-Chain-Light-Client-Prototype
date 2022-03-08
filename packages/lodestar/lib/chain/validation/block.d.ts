import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { allForks } from "@chainsafe/lodestar-beacon-state-transition";
import { ForkName } from "@chainsafe/lodestar-params";
import { IBeaconChain } from "../interface";
export declare function validateGossipBlock(config: IChainForkConfig, chain: IBeaconChain, signedBlock: allForks.SignedBeaconBlock, fork: ForkName): Promise<void>;
//# sourceMappingURL=block.d.ts.map