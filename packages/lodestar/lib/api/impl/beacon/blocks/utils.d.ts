import { allForks } from "@chainsafe/lodestar-types";
import { routes } from "@chainsafe/lodestar-api";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { IForkChoice } from "@chainsafe/lodestar-fork-choice";
import { IBeaconDb } from "../../../../db";
export declare function toBeaconHeaderResponse(config: IChainForkConfig, block: allForks.SignedBeaconBlock, canonical?: boolean): routes.beacon.BlockHeaderResponse;
export declare function resolveBlockId(forkChoice: IForkChoice, db: IBeaconDb, blockId: routes.beacon.BlockId): Promise<allForks.SignedBeaconBlock>;
//# sourceMappingURL=utils.d.ts.map