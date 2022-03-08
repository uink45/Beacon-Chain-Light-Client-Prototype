import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { allForks } from "@chainsafe/lodestar-types";
/**
 * Assert this chain segment of blocks is linear with slot numbers and hashes
 */
export declare function assertLinearChainSegment(config: IChainForkConfig, blocks: allForks.SignedBeaconBlock[]): void;
//# sourceMappingURL=chainSegment.d.ts.map