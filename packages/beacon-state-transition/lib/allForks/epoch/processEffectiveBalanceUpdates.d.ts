import { EpochProcess, CachedBeaconStateAllForks } from "../../types";
/**
 * Update effective balances if validator.balance has changed enough
 *
 * PERF: Cost 'proportional' to $VALIDATOR_COUNT, to iterate over all balances. Then cost is proportional to the amount
 * of validators whose effectiveBalance changed. Worst case is a massive network leak or a big slashing event which
 * causes a large amount of the network to decrease their balance simultaneously.
 *
 * - On normal mainnet conditions 0 validators change their effective balance
 * - In case of big innactivity event a medium portion of validators may have their effectiveBalance updated
 */
export declare function processEffectiveBalanceUpdates(state: CachedBeaconStateAllForks, epochProcess: EpochProcess): void;
//# sourceMappingURL=processEffectiveBalanceUpdates.d.ts.map