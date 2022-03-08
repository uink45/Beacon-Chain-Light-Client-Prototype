import { LodestarError } from "@chainsafe/lodestar-utils";
import { RpcResponseStatusError } from "../../../constants";
import { Method, Encoding } from "../types";
import { ResponseError } from "../response";
export declare enum RequestErrorCode {
    /** `<response_chunk>` had `<result>` === INVALID_REQUEST */
    INVALID_REQUEST = "REQUEST_ERROR_INVALID_REQUEST",
    /** `<response_chunk>` had `<result>` === SERVER_ERROR */
    SERVER_ERROR = "REQUEST_ERROR_SERVER_ERROR",
    /** `<response_chunk>` had `<result>` === RESOURCE_UNAVAILABLE */
    RESOURCE_UNAVAILABLE = "RESOURCE_UNAVAILABLE_ERROR",
    /** `<response_chunk>` had a `<result>` not known in the current spec */
    UNKNOWN_ERROR_STATUS = "REQUEST_ERROR_UNKNOWN_ERROR_STATUS",
    /** Could not open a stream with peer before DIAL_TIMEOUT */
    DIAL_TIMEOUT = "REQUEST_ERROR_DIAL_TIMEOUT",
    /** Error opening a stream with peer */
    DIAL_ERROR = "REQUEST_ERROR_DIAL_ERROR",
    /** Reponder did not close write stream before REQUEST_TIMEOUT */
    REQUEST_TIMEOUT = "REQUEST_ERROR_REQUEST_TIMEOUT",
    /** Error when sending request to responder */
    REQUEST_ERROR = "REQUEST_ERROR_REQUEST_ERROR",
    /** Reponder did not deliver a full reponse before max maxTotalResponseTimeout() */
    RESPONSE_TIMEOUT = "REQUEST_ERROR_RESPONSE_TIMEOUT",
    /** A single-response method returned 0 chunks */
    EMPTY_RESPONSE = "REQUEST_ERROR_EMPTY_RESPONSE",
    /** Time to first byte timeout */
    TTFB_TIMEOUT = "REQUEST_ERROR_TTFB_TIMEOUT",
    /** Timeout between `<response_chunk>` exceed */
    RESP_TIMEOUT = "REQUEST_ERROR_RESP_TIMEOUT"
}
declare type RequestErrorType = {
    code: RequestErrorCode.INVALID_REQUEST;
    errorMessage: string;
} | {
    code: RequestErrorCode.SERVER_ERROR;
    errorMessage: string;
} | {
    code: RequestErrorCode.RESOURCE_UNAVAILABLE;
    errorMessage: string;
} | {
    code: RequestErrorCode.UNKNOWN_ERROR_STATUS;
    status: RpcResponseStatusError;
    errorMessage: string;
} | {
    code: RequestErrorCode.DIAL_TIMEOUT;
} | {
    code: RequestErrorCode.DIAL_ERROR;
    error: Error;
} | {
    code: RequestErrorCode.REQUEST_TIMEOUT;
} | {
    code: RequestErrorCode.REQUEST_ERROR;
    error: Error;
} | {
    code: RequestErrorCode.RESPONSE_TIMEOUT;
} | {
    code: RequestErrorCode.EMPTY_RESPONSE;
} | {
    code: RequestErrorCode.TTFB_TIMEOUT;
} | {
    code: RequestErrorCode.RESP_TIMEOUT;
};
export interface IRequestErrorMetadata {
    method: Method;
    encoding: Encoding;
    peer: string;
}
/**
 * Same error types as RequestError but without metadata.
 * Top level function sendRequest() must rethrow RequestInternalError with metadata
 */
export declare class RequestInternalError extends LodestarError<RequestErrorType> {
    constructor(type: RequestErrorType);
}
export declare class RequestError extends LodestarError<RequestErrorType & IRequestErrorMetadata> {
    constructor(type: RequestErrorType, metadata: IRequestErrorMetadata);
}
/**
 * Parse response status errors into detailed request errors for each status code for easier debugging
 */
export declare function responseStatusErrorToRequestError(e: ResponseError): RequestErrorType;
export {};
//# sourceMappingURL=errors.d.ts.map