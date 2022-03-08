import { phase0 } from "@chainsafe/lodestar-types";
import { CachedBeaconStateAllForks } from "../../types";
/**
 * Check if `indexedAttestation` has sorted and unique indices and a valid aggregate signature.
 */
export declare function isValidIndexedAttestation(state: CachedBeaconStateAllForks, indexedAttestation: phase0.IndexedAttestation, verifySignature?: boolean): boolean;
//# sourceMappingURL=isValidIndexedAttestation.d.ts.map