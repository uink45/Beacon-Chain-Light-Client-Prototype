import { CachedBeaconStateAltair } from "../../types";
/**
 * Updates `state.previousEpochParticipation` with precalculated epoch participation. Creates a new empty tree for
 * `state.currentEpochParticipation`.
 *
 * PERF: Cost = 'proportional' $VALIDATOR_COUNT. Since it updates all of them at once, it will always recreate both
 * trees completely.
 */
export declare function processParticipationFlagUpdates(state: CachedBeaconStateAltair): void;
//# sourceMappingURL=processParticipationFlagUpdates.d.ts.map