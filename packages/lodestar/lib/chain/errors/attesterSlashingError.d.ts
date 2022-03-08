import { GossipActionError } from "./gossipValidation";
export declare enum AttesterSlashingErrorCode {
    ALREADY_EXISTS = "ATTESTATION_SLASHING_ERROR_ALREADY_EXISTS",
    INVALID = "ATTESTATION_SLASHING_ERROR_INVALID"
}
export declare type AttesterSlashingErrorType = {
    code: AttesterSlashingErrorCode.ALREADY_EXISTS;
} | {
    code: AttesterSlashingErrorCode.INVALID;
    error: Error;
};
export declare class AttesterSlashingError extends GossipActionError<AttesterSlashingErrorType> {
}
//# sourceMappingURL=attesterSlashingError.d.ts.map