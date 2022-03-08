"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnTypes = exports.getReqSerializers = exports.routesData = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
const utils_1 = require("../utils");
/**
 * Define javascript values for each route
 */
exports.routesData = {
    getWtfNode: { url: "/eth/v1/lodestar/wtfnode", method: "GET" },
    writeHeapdump: { url: "/eth/v1/lodestar/writeheapdump", method: "POST" },
    getLatestWeakSubjectivityCheckpointEpoch: { url: "/eth/v1/lodestar/ws_epoch", method: "GET" },
    getSyncChainsDebugState: { url: "/eth/v1/lodestar/sync-chains-debug-state", method: "GET" },
    getGossipQueueItems: { url: "/eth/v1/lodestar/gossip-queue-items/:gossipType", method: "GET" },
    getRegenQueueItems: { url: "/eth/v1/lodestar/regen-queue-items", method: "GET" },
    getBlockProcessorQueueItems: { url: "/eth/v1/lodestar/block-processor-queue-items", method: "GET" },
    getStateCacheItems: { url: "/eth/v1/lodestar/state-cache-items", method: "GET" },
    getCheckpointStateCacheItems: { url: "/eth/v1/lodestar/checkpoint-state-cache-items", method: "GET" },
    runGC: { url: "/eth/v1/lodestar/gc", method: "POST" },
    dropStateCache: { url: "/eth/v1/lodestar/drop-state-cache", method: "POST" },
    connectPeer: { url: "/eth/v1/lodestar/connect_peer", method: "POST" },
    disconnectPeer: { url: "/eth/v1/lodestar/disconnect_peer", method: "POST" },
    discv5GetKadValues: { url: "/eth/v1/debug/discv5-kad-values", method: "GET" },
};
function getReqSerializers() {
    return {
        getWtfNode: utils_1.reqEmpty,
        writeHeapdump: {
            writeReq: (dirpath) => ({ query: { dirpath } }),
            parseReq: ({ query }) => [query.dirpath],
            schema: { query: { dirpath: utils_1.Schema.String } },
        },
        getLatestWeakSubjectivityCheckpointEpoch: utils_1.reqEmpty,
        getSyncChainsDebugState: utils_1.reqEmpty,
        getGossipQueueItems: {
            writeReq: (gossipType) => ({ params: { gossipType } }),
            parseReq: ({ params }) => [params.gossipType],
            schema: { params: { gossipType: utils_1.Schema.StringRequired } },
        },
        getRegenQueueItems: utils_1.reqEmpty,
        getBlockProcessorQueueItems: utils_1.reqEmpty,
        getStateCacheItems: utils_1.reqEmpty,
        getCheckpointStateCacheItems: utils_1.reqEmpty,
        runGC: utils_1.reqEmpty,
        dropStateCache: utils_1.reqEmpty,
        connectPeer: {
            writeReq: (peerId, multiaddr) => ({ query: { peerId, multiaddr } }),
            parseReq: ({ query }) => [query.peerId, query.multiaddr],
            schema: { query: { peerId: utils_1.Schema.StringRequired, multiaddr: utils_1.Schema.StringArray } },
        },
        disconnectPeer: {
            writeReq: (peerId) => ({ query: { peerId } }),
            parseReq: ({ query }) => [query.peerId],
            schema: { query: { peerId: utils_1.Schema.StringRequired } },
        },
        discv5GetKadValues: utils_1.reqEmpty,
    };
}
exports.getReqSerializers = getReqSerializers;
/* eslint-disable @typescript-eslint/naming-convention */
function getReturnTypes() {
    const stringType = new lodestar_types_1.StringType();
    const GossipQueueItem = new ssz_1.ContainerType({
        fields: {
            topic: stringType,
            receivedFrom: stringType,
            data: new ssz_1.ByteVectorType({ length: 256 }),
            addedTimeMs: lodestar_types_1.ssz.Slot,
        },
        // Custom type, not in the consensus specs
        casingMap: {
            topic: "topic",
            receivedFrom: "received_from",
            data: "data",
            addedTimeMs: "added_time_ms",
        },
    });
    return {
        getWtfNode: (0, utils_1.sameType)(),
        writeHeapdump: (0, utils_1.sameType)(),
        getLatestWeakSubjectivityCheckpointEpoch: (0, utils_1.sameType)(),
        getSyncChainsDebugState: (0, utils_1.jsonType)(),
        getGossipQueueItems: (0, utils_1.ArrayOf)(GossipQueueItem),
        getRegenQueueItems: (0, utils_1.jsonType)(),
        getBlockProcessorQueueItems: (0, utils_1.jsonType)(),
        getStateCacheItems: (0, utils_1.jsonType)(),
        getCheckpointStateCacheItems: (0, utils_1.jsonType)(),
        discv5GetKadValues: (0, utils_1.jsonType)(),
    };
}
exports.getReturnTypes = getReturnTypes;
//# sourceMappingURL=lodestar.js.map