import { fetch } from "cross-fetch";
import { AbortSignal } from "@chainsafe/abort-controller";
import { ReqGeneric, RouteDef } from "../../utils";
export declare class HttpError extends Error {
    status: number;
    url: string;
    constructor(message: string, status: number, url: string);
}
export declare type FetchOpts = {
    url: RouteDef["url"];
    method: RouteDef["method"];
    query?: ReqGeneric["query"];
    body?: ReqGeneric["body"];
    headers?: ReqGeneric["headers"];
};
export interface IHttpClient {
    baseUrl: string;
    json<T>(opts: FetchOpts): Promise<T>;
    arrayBuffer(opts: FetchOpts): Promise<ArrayBuffer>;
}
export declare type HttpClientOptions = {
    baseUrl: string;
    timeoutMs?: number;
    /** Return an AbortSignal to be attached to all requests */
    getAbortSignal?: () => AbortSignal | undefined;
    /** Override fetch function */
    fetch?: typeof fetch;
};
export declare class HttpClient implements IHttpClient {
    readonly baseUrl: string;
    private readonly timeoutMs;
    private readonly getAbortSignal?;
    private readonly fetch;
    /**
     * timeoutMs = config.params.SECONDS_PER_SLOT * 1000
     */
    constructor(opts: HttpClientOptions);
    json<T>(opts: FetchOpts): Promise<T>;
    arrayBuffer(opts: FetchOpts): Promise<ArrayBuffer>;
    private request;
}
//# sourceMappingURL=httpClient.d.ts.map