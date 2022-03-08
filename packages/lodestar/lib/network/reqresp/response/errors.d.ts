import { LodestarError } from "@chainsafe/lodestar-utils";
import { RespStatus, RpcResponseStatusError } from "../../../constants";
declare type RpcResponseStatusNotSuccess = Exclude<RespStatus, RespStatus.SUCCESS>;
export declare enum ResponseErrorCode {
    RESPONSE_STATUS_ERROR = "RESPONSE_STATUS_ERROR"
}
declare type RequestErrorType = {
    code: ResponseErrorCode;
    status: RpcResponseStatusError;
    errorMessage: string;
};
/**
 * Used internally only to signal a response status error. Since the error should never bubble up to the user,
 * the error code and error message does not matter much.
 */
export declare class ResponseError extends LodestarError<RequestErrorType> {
    status: RpcResponseStatusNotSuccess;
    errorMessage: string;
    constructor(status: RpcResponseStatusNotSuccess, errorMessage: string);
}
export {};
//# sourceMappingURL=errors.d.ts.map