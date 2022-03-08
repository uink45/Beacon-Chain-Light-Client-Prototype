import { GossipActionError } from "./gossipValidation";
export declare enum ProposerSlashingErrorCode {
    ALREADY_EXISTS = "PROPOSER_SLASHING_ERROR_ALREADY_EXISTS",
    INVALID = "PROPOSER_SLASHING_ERROR_INVALID"
}
export declare type ProposerSlashingErrorType = {
    code: ProposerSlashingErrorCode.ALREADY_EXISTS;
} | {
    code: ProposerSlashingErrorCode.INVALID;
    error: Error;
};
export declare class ProposerSlashingError extends GossipActionError<ProposerSlashingErrorType> {
}
//# sourceMappingURL=proposerSlashingError.d.ts.map