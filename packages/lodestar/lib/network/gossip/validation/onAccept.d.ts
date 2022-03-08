import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { GossipType, GossipTypeMap, GossipTopicTypeMap } from "../interface";
export declare type GetGossipAcceptMetadataFn = (config: IChainForkConfig, object: GossipTypeMap[GossipType], topic: GossipTopicTypeMap[GossipType]) => Record<string, string | number>;
export declare type GetGossipAcceptMetadataFns = {
    [K in GossipType]: (config: IChainForkConfig, object: GossipTypeMap[K], topic: GossipTopicTypeMap[K]) => Record<string, string | number>;
};
/**
 * Return succint but meaningful data about accepted gossip objects.
 * This data is logged at the debug level extremely frequently so it must be short.
 */
export declare const getGossipAcceptMetadataByType: GetGossipAcceptMetadataFns;
//# sourceMappingURL=onAccept.d.ts.map