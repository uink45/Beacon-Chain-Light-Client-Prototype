import { CachedBeaconStateAltair, EpochProcess } from "../../types";
/**
 * An aggregate of getFlagIndexDeltas and getInactivityPenaltyDeltas that loop through process.statuses 1 time instead of 4.
 *
 * - On normal mainnet conditions
 *   - prevSourceAttester: 98%
 *   - prevTargetAttester: 96%
 *   - prevHeadAttester:   93%
 *   - currSourceAttester: 95%
 *   - currTargetAttester: 93%
 *   - currHeadAttester:   91%
 *   - unslashed:          100%
 *   - eligibleAttester:   98%
 */
export declare function getRewardsAndPenalties(state: CachedBeaconStateAltair, process: EpochProcess): [number[], number[]];
//# sourceMappingURL=getRewardsAndPenalties.d.ts.map