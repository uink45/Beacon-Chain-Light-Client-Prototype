import { EpochProcess, CachedBeaconStateAllForks } from "../../types";
/**
 * Update validator registry for validators that activate + exit
 *
 * PERF: Cost 'proportional' to only validators that active + exit. For mainnet conditions:
 * - indicesEligibleForActivationQueue: Maxing deposits triggers 512 validator mutations
 * - indicesEligibleForActivation: 4 per epoch
 * - indicesToEject: Potentially the entire validator set. On a massive offline event this could trigger many mutations
 *   per epoch. Note that once mutated that validator can't be added to indicesToEject.
 *
 * - On normal mainnet conditions only 4 validators will be updated
 *   - indicesEligibleForActivation: ~4000
 *   - indicesEligibleForActivationQueue: 0
 *   - indicesToEject: 0
 */
export declare function processRegistryUpdates(state: CachedBeaconStateAllForks, epochProcess: EpochProcess): void;
//# sourceMappingURL=processRegistryUpdates.d.ts.map