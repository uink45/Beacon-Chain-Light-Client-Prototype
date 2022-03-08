import { phase0 } from "@chainsafe/lodestar-types";
import { IBeaconChain } from "../../../chain";
import { IBeaconDb } from "../../../db";
import { ReqRespBlockResponse } from "../types";
export declare type ReqRespHandlers = {
    onStatus(): AsyncIterable<phase0.Status>;
    onBeaconBlocksByRange(req: phase0.BeaconBlocksByRangeRequest): AsyncIterable<ReqRespBlockResponse>;
    onBeaconBlocksByRoot(req: phase0.BeaconBlocksByRootRequest): AsyncIterable<ReqRespBlockResponse>;
};
/**
 * The ReqRespHandler module handles app-level requests / responses from other peers,
 * fetching state from the chain and database as needed.
 */
export declare function getReqRespHandlers({ db, chain }: {
    db: IBeaconDb;
    chain: IBeaconChain;
}): ReqRespHandlers;
//# sourceMappingURL=index.d.ts.map