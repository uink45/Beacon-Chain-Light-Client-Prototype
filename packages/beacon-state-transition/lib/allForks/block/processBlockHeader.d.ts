import { allForks } from "@chainsafe/lodestar-types";
import { CachedBeaconStateAllForks } from "../../types";
/**
 * Converts a Deposit record (created by the eth1 deposit contract) into a Validator object that goes into the eth2 state.
 *
 * PERF: Fixed work independent of block contents.
 * NOTE: `block` body root MUST be pre-cached.
 */
export declare function processBlockHeader(state: CachedBeaconStateAllForks, block: allForks.BeaconBlock): void;
//# sourceMappingURL=processBlockHeader.d.ts.map