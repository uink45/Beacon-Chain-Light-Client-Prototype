import { ApiModules } from "../types";
import { routes } from "@chainsafe/lodestar-api";
import { IApiOptions } from "../../options";
export declare function getLightclientApi(opts: IApiOptions, { chain, config, db }: Pick<ApiModules, "chain" | "config" | "db">): routes.lightclient.Api;
//# sourceMappingURL=index.d.ts.map