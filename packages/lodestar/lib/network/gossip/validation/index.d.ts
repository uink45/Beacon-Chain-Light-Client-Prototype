import { AbortSignal } from "@chainsafe/abort-controller";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IMetrics } from "../../../metrics";
import { GossipJobQueues, ValidatorFnsByType, GossipHandlers } from "../interface";
import { UncompressCache } from "../encoding";
import { IPeerRpcScoreStore } from "../../peers/score";
declare type ValidatorFnModules = {
    config: IChainForkConfig;
    logger: ILogger;
    peerRpcScores: IPeerRpcScoreStore;
    metrics: IMetrics | null;
    uncompressCache: UncompressCache;
};
/**
 * Returns GossipValidatorFn for each GossipType, given GossipHandlerFn indexed by type.
 *
 * @see getGossipHandlers for reasoning on why GossipHandlerFn are used for gossip validation.
 */
export declare function createValidatorFnsByType(gossipHandlers: GossipHandlers, modules: ValidatorFnModules & {
    signal: AbortSignal;
}): {
    validatorFnsByType: ValidatorFnsByType;
    jobQueues: GossipJobQueues;
};
export {};
//# sourceMappingURL=index.d.ts.map