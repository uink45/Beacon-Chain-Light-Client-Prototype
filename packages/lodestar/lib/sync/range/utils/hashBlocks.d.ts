import { allForks } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
/**
 * Hash SignedBeaconBlock in a byte form easy to compare only
 * @param blocks
 * @param config
 */
export declare function hashBlocks(blocks: allForks.SignedBeaconBlock[], config: IChainForkConfig): Uint8Array;
//# sourceMappingURL=hashBlocks.d.ts.map