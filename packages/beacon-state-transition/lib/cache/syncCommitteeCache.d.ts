import { altair, ValidatorIndex } from "@chainsafe/lodestar-types";
import { PubkeyIndexMap } from "./pubkeyCache";
declare type SyncComitteeValidatorIndexMap = Map<ValidatorIndex, number[]>;
export declare type SyncCommitteeCache = {
    /**
     * Update freq: every ~ 27h.
     * Memory cost: 512 Number integers.
     */
    validatorIndices: ValidatorIndex[];
    /**
     * Update freq: every ~ 27h.
     * Memory cost: Map of Number -> Number with 512 entries.
     */
    validatorIndexMap: SyncComitteeValidatorIndexMap;
};
/** Placeholder object for pre-altair fork */
export declare class SyncCommitteeCacheEmpty implements SyncCommitteeCache {
    get validatorIndices(): ValidatorIndex[];
    get validatorIndexMap(): SyncComitteeValidatorIndexMap;
}
export declare function getSyncCommitteeCache(validatorIndices: ValidatorIndex[]): SyncCommitteeCache;
export declare function computeSyncCommitteeCache(syncCommittee: altair.SyncCommittee, pubkey2index: PubkeyIndexMap): SyncCommitteeCache;
/**
 * Compute all index in sync committee for all validatorIndexes in `syncCommitteeIndexes`.
 * Helps reduce work necessary to verify a validatorIndex belongs in a sync committee and which.
 * This is similar to compute_subnets_for_sync_committee in https://github.com/ethereum/eth2.0-specs/blob/v1.1.0-alpha.5/specs/altair/validator.md
 */
export declare function computeSyncComitteeMap(syncCommitteeIndexes: ValidatorIndex[]): SyncComitteeValidatorIndexMap;
export {};
//# sourceMappingURL=syncCommitteeCache.d.ts.map