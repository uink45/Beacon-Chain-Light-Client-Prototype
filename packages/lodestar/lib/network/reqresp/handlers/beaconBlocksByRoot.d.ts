import { phase0 } from "@chainsafe/lodestar-types";
import { IBeaconChain } from "../../../chain";
import { IBeaconDb } from "../../../db";
import { ReqRespBlockResponse } from "../types";
export declare function onBeaconBlocksByRoot(requestBody: phase0.BeaconBlocksByRootRequest, chain: IBeaconChain, db: IBeaconDb): AsyncIterable<ReqRespBlockResponse>;
//# sourceMappingURL=beaconBlocksByRoot.d.ts.map