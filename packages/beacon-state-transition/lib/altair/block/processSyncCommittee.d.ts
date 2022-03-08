import { altair } from "@chainsafe/lodestar-types";
import { ISignatureSet } from "../../util";
import { CachedBeaconStateAltair } from "../../types";
export declare function processSyncAggregate(state: CachedBeaconStateAltair, block: altair.BeaconBlock, verifySignatures?: boolean): void;
export declare function getSyncCommitteeSignatureSet(state: CachedBeaconStateAltair, block: altair.BeaconBlock, 
/** Optional parameter to prevent computing it twice */
participantIndices?: number[]): ISignatureSet | null;
//# sourceMappingURL=processSyncCommittee.d.ts.map