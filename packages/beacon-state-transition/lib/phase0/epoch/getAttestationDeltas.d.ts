import { EpochProcess, CachedBeaconStatePhase0 } from "../../types";
/**
 * Return attestation reward/penalty deltas for each validator.
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
export declare function getAttestationDeltas(state: CachedBeaconStatePhase0, epochProcess: EpochProcess): [number[], number[]];
//# sourceMappingURL=getAttestationDeltas.d.ts.map