import { phase0 } from "@chainsafe/lodestar-types";
import { CachedBeaconStateAllForks } from "../../types";
/**
 * Process a VoluntaryExit operation. Initiates the exit of a validator.
 *
 * PERF: Work depends on number of VoluntaryExit per block. On regular networks the average is 0 / block.
 */
export declare function processVoluntaryExitAllForks(state: CachedBeaconStateAllForks, signedVoluntaryExit: phase0.SignedVoluntaryExit, verifySignature?: boolean): void;
export declare function isValidVoluntaryExit(state: CachedBeaconStateAllForks, signedVoluntaryExit: phase0.SignedVoluntaryExit, verifySignature?: boolean): boolean;
//# sourceMappingURL=processVoluntaryExit.d.ts.map