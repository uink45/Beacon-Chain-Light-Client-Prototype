import { phase0 } from "@chainsafe/lodestar-types";
import { IBeaconChain } from "../../../chain";
import { IBeaconDb } from "../../../db";
import { ReqRespBlockResponse } from "../types";
export declare function onBeaconBlocksByRange(requestBody: phase0.BeaconBlocksByRangeRequest, chain: IBeaconChain, db: IBeaconDb): AsyncIterable<ReqRespBlockResponse>;
export declare function injectRecentBlocks(archiveStream: AsyncIterable<ReqRespBlockResponse>, chain: IBeaconChain, db: IBeaconDb, request: phase0.BeaconBlocksByRangeRequest): AsyncGenerator<ReqRespBlockResponse>;
//# sourceMappingURL=beaconBlocksByRange.d.ts.map