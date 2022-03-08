import { AbortSignal } from "@chainsafe/abort-controller";
import { IJson, IRpcPayload, ReqOpts } from "../interface";
interface IRpcResponseError {
    jsonrpc: "2.0";
    id: number;
    error?: {
        code: number;
        message: string;
    };
}
export interface IJsonRpcHttpClient {
    fetch<R, P = IJson[]>(payload: IRpcPayload<P>, opts?: ReqOpts): Promise<R>;
    fetchBatch<R>(rpcPayloadArr: IRpcPayload[], opts?: ReqOpts): Promise<R[]>;
}
export declare class JsonRpcHttpClient implements IJsonRpcHttpClient {
    private readonly urls;
    private readonly opts?;
    private id;
    /**
     * Optional: If provided, use this jwt secret to HS256 encode and add a jwt token in the
     * request header which can be authenticated by the RPC server to provide access.
     * A fresh token is generated on each requests as EL spec mandates the ELs to check
     * the token freshness +-5 seconds (via `iat` property of the token claim)
     */
    private jwtSecret?;
    constructor(urls: string[], opts?: {
        signal?: AbortSignal | undefined;
        timeout?: number | undefined;
        /** If returns true, do not fallback to other urls and throw early */
        shouldNotFallback?: ((error: Error) => boolean) | undefined;
        /**
         * If provided, the requests to the RPC server will be bundled with a HS256 encoded
         * token using this secret. Otherwise the requests to the RPC server will be unauthorized
         * and it might deny responses to the RPC requests.
         */
        jwtSecret?: Uint8Array | undefined;
    } | undefined);
    /**
     * Perform RPC request
     */
    fetch<R, P = IJson[]>(payload: IRpcPayload<P>, opts?: ReqOpts): Promise<R>;
    /**
     * Perform RPC batched request
     * Type-wise assumes all requests results have the same type
     */
    fetchBatch<R>(rpcPayloadArr: IRpcPayload[], opts?: ReqOpts): Promise<R[]>;
    private fetchJson;
    /**
     * Fetches JSON and throws detailed errors in case the HTTP request is not ok
     */
    private fetchJsonOneUrl;
}
export declare class ErrorParseJson extends Error {
    constructor(json: string, e: Error);
}
/** JSON RPC endpoint returned status code == 200, but with error property set */
export declare class ErrorJsonRpcResponse<P> extends Error {
    response: IRpcResponseError;
    payload: IRpcPayload<P>;
    constructor(res: IRpcResponseError, payload: IRpcPayload<P>);
}
/** JSON RPC endpoint returned status code != 200 */
export declare class HttpRpcError extends Error {
    readonly status: number;
    constructor(status: number, message: string);
}
export {};
//# sourceMappingURL=jsonRpcHttpClient.d.ts.map