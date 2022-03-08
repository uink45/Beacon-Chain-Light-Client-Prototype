/**
 * @module chain/stateTransition/util
 */
import { phase0, Slot, ValidatorIndex } from "@chainsafe/lodestar-types";
/**
 * Check if [[data1]] and [[data2]] are slashable according to Casper FFG rules.
 */
export declare function isSlashableAttestationData(data1: phase0.AttestationData, data2: phase0.AttestationData): boolean;
export declare function isValidAttestationSlot(attestationSlot: Slot, currentSlot: Slot): boolean;
export declare function getAttesterSlashableIndices(attesterSlashing: phase0.AttesterSlashing): ValidatorIndex[];
//# sourceMappingURL=attestation.d.ts.map