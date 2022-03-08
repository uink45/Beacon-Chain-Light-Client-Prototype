import { altair } from "@chainsafe/lodestar-types";
import { IBeaconChain } from "../interface";
/**
 * Spec v1.1.0-beta.2
 */
export declare function validateSyncCommitteeGossipContributionAndProof(chain: IBeaconChain, signedContributionAndProof: altair.SignedContributionAndProof): Promise<{
    syncCommitteeParticipants: number;
}>;
//# sourceMappingURL=syncCommitteeContributionAndProof.d.ts.map