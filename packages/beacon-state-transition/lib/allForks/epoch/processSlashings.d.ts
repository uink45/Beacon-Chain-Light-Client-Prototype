import { ForkName } from "@chainsafe/lodestar-params";
import { CachedBeaconStateAllForks, EpochProcess } from "../../types";
/**
 * Update validator registry for validators that activate + exit
 *
 * PERF: Cost 'proportional' to only validators that are slashed. For mainnet conditions:
 * - indicesToSlash: max len is 8704. But it's very unlikely since it would require all validators on the same
 *   committees to sign slashable attestations.
 *
 * - On normal mainnet conditions indicesToSlash = 0
 */
export declare function processSlashingsAllForks(fork: ForkName, state: CachedBeaconStateAllForks, process: EpochProcess): void;
//# sourceMappingURL=processSlashings.d.ts.map