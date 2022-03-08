import { Api } from "@chainsafe/lodestar-api";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { IMetrics } from "../../metrics";
export { allNamespaces } from "@chainsafe/lodestar-api";
export declare type RestApiOptions = {
    enabled: boolean;
    api: (keyof Api)[];
    host: string;
    cors: string;
    port: number;
};
export declare const restApiOptionsDefault: RestApiOptions;
export interface IRestApiModules {
    config: IBeaconConfig;
    logger: ILogger;
    api: Api;
    metrics: IMetrics | null;
}
/**
 * REST API powered by `fastify` server.
 */
export declare class RestApi {
    private readonly opts;
    private readonly server;
    private readonly logger;
    private readonly activeRequests;
    constructor(optsArg: Partial<RestApiOptions>, modules: IRestApiModules);
    /**
     * Start the REST API server.
     */
    listen(): Promise<void>;
    /**
     * Close the server instance and terminate all existing connections.
     */
    close(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map