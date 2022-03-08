import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Api } from "../interface";
import { IHttpClient, HttpClient, HttpClientOptions, HttpError } from "./utils";
export { HttpClient, HttpClientOptions, HttpError };
/**
 * REST HTTP client for all routes
 */
export declare function getClient(config: IChainForkConfig, opts: HttpClientOptions, httpClient?: IHttpClient): Api;
//# sourceMappingURL=index.d.ts.map