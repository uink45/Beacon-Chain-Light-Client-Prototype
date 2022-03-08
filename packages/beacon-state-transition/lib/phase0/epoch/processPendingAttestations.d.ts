import { Epoch, phase0 } from "@chainsafe/lodestar-types";
import { List } from "@chainsafe/ssz";
import { CachedBeaconStatePhase0 } from "../../types";
import { IAttesterStatus } from "../../util/attesterStatus";
/**
 * Mutates `statuses` from all pending attestations.
 *
 * PERF: Cost 'proportional' to attestation count + how many bits per attestation + how many flags the attestation triggers
 *
 * - On normal mainnet conditions:
 *   - previousEpochAttestations: 3403
 *   - currentEpochAttestations:  3129
 *   - previousEpochAttestationsBits: 83
 *   - currentEpochAttestationsBits:  85
 */
export declare function statusProcessEpoch(state: CachedBeaconStatePhase0, statuses: IAttesterStatus[], attestations: List<phase0.PendingAttestation>, epoch: Epoch, sourceFlag: number, targetFlag: number, headFlag: number): void;
//# sourceMappingURL=processPendingAttestations.d.ts.map