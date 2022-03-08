import { allForks } from "@chainsafe/lodestar-types";
import { ISignatureSet } from "../../util/signatureSets";
import { CachedBeaconStateAllForks } from "../../types";
export declare function verifyProposerSignature(state: CachedBeaconStateAllForks, signedBlock: allForks.SignedBeaconBlock): boolean;
export declare function getProposerSignatureSet(state: CachedBeaconStateAllForks, signedBlock: allForks.SignedBeaconBlock): ISignatureSet;
//# sourceMappingURL=proposer.d.ts.map