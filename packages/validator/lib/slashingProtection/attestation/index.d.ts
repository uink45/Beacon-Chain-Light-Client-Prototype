import { BLSPubkey } from "@chainsafe/lodestar-types";
import { MinMaxSurround } from "../minMaxSurround";
import { SlashingProtectionAttestation } from "../types";
import { InvalidAttestationError, InvalidAttestationErrorCode } from "./errors";
import { AttestationByTargetRepository } from "./attestationByTargetRepository";
import { AttestationLowerBoundRepository } from "./attestationLowerBoundRepository";
export { AttestationByTargetRepository, AttestationLowerBoundRepository, InvalidAttestationError, InvalidAttestationErrorCode, };
declare enum SafeStatus {
    SAME_DATA = "SAFE_STATUS_SAME_DATA",
    OK = "SAFE_STATUS_OK"
}
export declare class SlashingProtectionAttestationService {
    private attestationByTarget;
    private attestationLowerBound;
    private minMaxSurround;
    constructor(signedAttestationDb: AttestationByTargetRepository, attestationLowerBound: AttestationLowerBoundRepository, minMaxSurround: MinMaxSurround);
    /**
     * Check an attestation for slash safety, and if it is safe, record it in the database
     * This is the safe, externally-callable interface for checking attestations
     */
    checkAndInsertAttestation(pubKey: BLSPubkey, attestation: SlashingProtectionAttestation): Promise<void>;
    /**
     * Check an attestation from `pubKey` for slash safety.
     */
    checkAttestation(pubKey: BLSPubkey, attestation: SlashingProtectionAttestation): Promise<SafeStatus>;
    /**
     * Insert an attestation into the slashing database
     * This should *only* be called in the same (exclusive) transaction as `checkAttestation`
     * so that the check isn't invalidated by a concurrent mutation
     */
    insertAttestation(pubKey: BLSPubkey, attestation: SlashingProtectionAttestation): Promise<void>;
    /**
     * Interchange import / export functionality
     */
    importAttestations(pubkey: BLSPubkey, attestations: SlashingProtectionAttestation[]): Promise<void>;
    /**
     * Interchange import / export functionality
     */
    exportAttestations(pubkey: BLSPubkey): Promise<SlashingProtectionAttestation[]>;
    listPubkeys(): Promise<BLSPubkey[]>;
}
//# sourceMappingURL=index.d.ts.map