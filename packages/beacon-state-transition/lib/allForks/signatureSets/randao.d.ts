import { allForks } from "@chainsafe/lodestar-types";
import { ISignatureSet } from "../../util";
import { CachedBeaconStateAllForks } from "../../types";
export declare function verifyRandaoSignature(state: CachedBeaconStateAllForks, block: allForks.BeaconBlock): boolean;
/**
 * Extract signatures to allow validating all block signatures at once
 */
export declare function getRandaoRevealSignatureSet(state: CachedBeaconStateAllForks, block: allForks.BeaconBlock): ISignatureSet;
//# sourceMappingURL=randao.d.ts.map