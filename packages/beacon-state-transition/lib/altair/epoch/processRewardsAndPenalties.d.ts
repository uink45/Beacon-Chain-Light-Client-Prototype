import { CachedBeaconStateAltair, EpochProcess } from "../../types";
/**
 * Iterate over all validator and compute rewards and penalties to apply to balances.
 *
 * PERF: Cost = 'proportional' to $VALIDATOR_COUNT. Extra work is done per validator the more status flags
 * are true, worst case: FLAG_UNSLASHED + FLAG_ELIGIBLE_ATTESTER + FLAG_PREV_*
 */
export declare function processRewardsAndPenalties(state: CachedBeaconStateAltair, epochProcess: EpochProcess): void;
//# sourceMappingURL=processRewardsAndPenalties.d.ts.map