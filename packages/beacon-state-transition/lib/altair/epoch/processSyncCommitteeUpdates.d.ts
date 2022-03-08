import { CachedBeaconStateAltair } from "../../types";
/**
 * Rotate nextSyncCommittee to currentSyncCommittee if sync committee period is over.
 *
 * PERF: Once every `EPOCHS_PER_SYNC_COMMITTEE_PERIOD`, do an expensive operation to compute the next committee.
 * Calculating the next sync committee has a proportional cost to $VALIDATOR_COUNT
 */
export declare function processSyncCommitteeUpdates(state: CachedBeaconStateAltair): void;
//# sourceMappingURL=processSyncCommitteeUpdates.d.ts.map