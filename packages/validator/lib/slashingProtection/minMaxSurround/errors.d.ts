import { LodestarError } from "@chainsafe/lodestar-utils";
import { MinMaxSurroundAttestation } from "./interface";
export declare enum SurroundAttestationErrorCode {
    /**
     * The provided attestation is surrounding at least another attestation from the store
     */
    IS_SURROUNDING = "ERR_SURROUND_ATTESTATION_IS_SURROUNDING",
    /**
     * The provided attestation is surrounded by at least another attestation from the store
     */
    IS_SURROUNDED = "ERR_SURROUND_ATTESTATION_IS_SURROUNDED"
}
declare type SurroundAttestationErrorType = {
    code: SurroundAttestationErrorCode.IS_SURROUNDING;
    attestation: MinMaxSurroundAttestation;
    attestation2Target: number;
} | {
    code: SurroundAttestationErrorCode.IS_SURROUNDED;
    attestation: MinMaxSurroundAttestation;
    attestation2Target: number;
};
export declare class SurroundAttestationError extends LodestarError<SurroundAttestationErrorType> {
    constructor(type: SurroundAttestationErrorType);
}
export {};
//# sourceMappingURL=errors.d.ts.map