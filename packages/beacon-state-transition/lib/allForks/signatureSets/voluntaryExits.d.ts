import { allForks, phase0 } from "@chainsafe/lodestar-types";
import { ISignatureSet } from "../../util";
import { CachedBeaconStateAllForks } from "../../types";
export declare function verifyVoluntaryExitSignature(state: CachedBeaconStateAllForks, signedVoluntaryExit: phase0.SignedVoluntaryExit): boolean;
/**
 * Extract signatures to allow validating all block signatures at once
 */
export declare function getVoluntaryExitSignatureSet(state: CachedBeaconStateAllForks, signedVoluntaryExit: phase0.SignedVoluntaryExit): ISignatureSet;
export declare function getVoluntaryExitsSignatureSets(state: CachedBeaconStateAllForks, signedBlock: allForks.SignedBeaconBlock): ISignatureSet[];
//# sourceMappingURL=voluntaryExits.d.ts.map