import { CachedBeaconStateAllForks, EpochProcess } from "../../types";
import { ForkName } from "@chainsafe/lodestar-params";
/**
 * Iterate over all validator and compute rewards and penalties to apply to balances.
 *
 * PERF: Cost = 'proportional' to $VALIDATOR_COUNT. Extra work is done per validator the more status flags
 * are true, worst case: FLAG_UNSLASHED + FLAG_ELIGIBLE_ATTESTER + FLAG_PREV_*
 */
export declare function processRewardsAndPenaltiesAllForks<T extends CachedBeaconStateAllForks>(fork: ForkName, state: T, epochProcess: EpochProcess): void;
//# sourceMappingURL=processRewardsAndPenalties.d.ts.map