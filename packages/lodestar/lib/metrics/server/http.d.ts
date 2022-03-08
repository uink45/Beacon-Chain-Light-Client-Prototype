/// <reference types="node" />
/**
 * @module metrics/server
 */
import http from "node:http";
import { Registry } from "prom-client";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IMetricsOptions } from "../options";
export interface IMetricsServer {
}
declare type RegistryHolder = {
    register: Registry;
};
export declare class HttpMetricsServer implements IMetricsServer {
    http: http.Server;
    private terminator;
    private opts;
    private register;
    private logger;
    private httpServerRegister;
    private scrapeTimeMetric;
    constructor(opts: IMetricsOptions, { metrics, logger }: {
        metrics: RegistryHolder;
        logger: ILogger;
    });
    start(): Promise<void>;
    stop(): Promise<void>;
    private onRequest;
}
export {};
//# sourceMappingURL=http.d.ts.map