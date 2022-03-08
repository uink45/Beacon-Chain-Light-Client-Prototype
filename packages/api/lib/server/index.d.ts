import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { FastifyInstance } from "fastify";
import { Api } from "../interface";
import { ServerRoute } from "./utils";
export declare type RouteConfig = {
    operationId: ServerRoute["id"];
};
export declare function registerRoutes(server: FastifyInstance, config: IChainForkConfig, api: Api, enabledNamespaces: (keyof Api)[]): void;
export declare function registerRoutesGroup(fastify: FastifyInstance, routes: Record<string, ServerRoute<any>>): void;
//# sourceMappingURL=index.d.ts.map