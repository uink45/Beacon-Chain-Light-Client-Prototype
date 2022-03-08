import { phase0 } from "@chainsafe/lodestar-types";
import { ForkName } from "@chainsafe/lodestar-params";
import { CachedBeaconStateAllForks } from "../../types";
/**
 * Process an AttesterSlashing operation. Initiates the exit of a validator, decreases the balance of the slashed
 * validators and increases the block proposer balance.
 *
 * PERF: Work depends on number of AttesterSlashing per block. On regular networks the average is 0 / block.
 */
export declare function processAttesterSlashing(fork: ForkName, state: CachedBeaconStateAllForks, attesterSlashing: phase0.AttesterSlashing, verifySignatures?: boolean): void;
export declare function assertValidAttesterSlashing(state: CachedBeaconStateAllForks, attesterSlashing: phase0.AttesterSlashing, verifySignatures?: boolean): void;
//# sourceMappingURL=processAttesterSlashing.d.ts.map