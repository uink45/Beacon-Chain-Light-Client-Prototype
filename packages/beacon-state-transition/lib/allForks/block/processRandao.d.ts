import { allForks } from "@chainsafe/lodestar-types";
import { CachedBeaconStateAllForks } from "../../types";
/**
 * Commit a randao reveal to generate pseudorandomness seeds
 *
 * PERF: Fixed work independent of block contents.
 */
export declare function processRandao(state: CachedBeaconStateAllForks, block: allForks.BeaconBlock, verifySignature?: boolean): void;
//# sourceMappingURL=processRandao.d.ts.map