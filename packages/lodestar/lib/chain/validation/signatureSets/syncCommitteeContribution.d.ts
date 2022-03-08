import { PublicKey } from "@chainsafe/bls";
import { altair } from "@chainsafe/lodestar-types";
import { CachedBeaconStateAltair, ISignatureSet } from "@chainsafe/lodestar-beacon-state-transition";
export declare function getSyncCommitteeContributionSignatureSet(state: CachedBeaconStateAltair, contribution: altair.SyncCommitteeContribution, pubkeys: PublicKey[]): ISignatureSet;
/**
 * Retrieve pubkeys in contribution aggregate using epochCtx:
 * - currSyncCommitteeIndexes cache
 * - index2pubkey cache
 */
export declare function getContributionPubkeys(state: CachedBeaconStateAltair, contribution: altair.SyncCommitteeContribution): PublicKey[];
//# sourceMappingURL=syncCommitteeContribution.d.ts.map