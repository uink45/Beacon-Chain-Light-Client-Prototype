import { allForks, phase0 } from "@chainsafe/lodestar-types";
import { ISignatureSet } from "../../util";
import { CachedBeaconStateAllForks } from "../../types";
/**
 * Extract signatures to allow validating all block signatures at once
 */
export declare function getProposerSlashingSignatureSets(state: CachedBeaconStateAllForks, proposerSlashing: phase0.ProposerSlashing): ISignatureSet[];
export declare function getProposerSlashingsSignatureSets(state: CachedBeaconStateAllForks, signedBlock: allForks.SignedBeaconBlock): ISignatureSet[];
//# sourceMappingURL=proposerSlashings.d.ts.map