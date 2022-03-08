import { GossipActionError } from "./gossipValidation";
export declare enum VoluntaryExitErrorCode {
    ALREADY_EXISTS = "VOLUNTARY_EXIT_ERROR_ALREADY_EXISTS",
    INVALID = "VOLUNTARY_EXIT_ERROR_INVALID",
    INVALID_SIGNATURE = "VOLUNTARY_EXIT_ERROR_INVALID_SIGNATURE"
}
export declare type VoluntaryExitErrorType = {
    code: VoluntaryExitErrorCode.ALREADY_EXISTS;
} | {
    code: VoluntaryExitErrorCode.INVALID;
} | {
    code: VoluntaryExitErrorCode.INVALID_SIGNATURE;
};
export declare class VoluntaryExitError extends GossipActionError<VoluntaryExitErrorType> {
}
//# sourceMappingURL=voluntaryExitError.d.ts.map