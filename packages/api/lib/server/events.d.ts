import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { ServerRoutes } from "./utils";
import { Api, ReqTypes } from "../routes/events";
export declare function getRoutes(config: IChainForkConfig, api: Api): ServerRoutes<Api, ReqTypes>;
export declare function serializeSSEEvent(chunk: {
    event: string;
    data: unknown;
}): string;
//# sourceMappingURL=events.d.ts.map