"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnTypes = exports.getReqSerializers = exports.routesData = exports.NodeHealth = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
const utils_1 = require("../utils");
var NodeHealth;
(function (NodeHealth) {
    NodeHealth[NodeHealth["READY"] = 200] = "READY";
    NodeHealth[NodeHealth["SYNCING"] = 206] = "SYNCING";
    NodeHealth[NodeHealth["NOT_INITIALIZED_OR_ISSUES"] = 503] = "NOT_INITIALIZED_OR_ISSUES";
})(NodeHealth = exports.NodeHealth || (exports.NodeHealth = {}));
exports.routesData = {
    getNetworkIdentity: { url: "/eth/v1/node/identity", method: "GET" },
    getPeers: { url: "/eth/v1/node/peers", method: "GET" },
    getPeer: { url: "/eth/v1/node/peers/:peerId", method: "GET" },
    getPeerCount: { url: "/eth/v1/node/peer_count", method: "GET" },
    getNodeVersion: { url: "/eth/v1/node/version", method: "GET" },
    getSyncingStatus: { url: "/eth/v1/node/syncing", method: "GET" },
    getHealth: { url: "/eth/v1/node/health", method: "GET" },
};
function getReqSerializers() {
    return {
        getNetworkIdentity: utils_1.reqEmpty,
        getPeers: {
            writeReq: (filters) => ({ query: filters || {} }),
            parseReq: ({ query }) => [query],
            schema: { query: { state: utils_1.Schema.StringArray, direction: utils_1.Schema.StringArray } },
        },
        getPeer: {
            writeReq: (peerId) => ({ params: { peerId } }),
            parseReq: ({ params }) => [params.peerId],
            schema: { params: { peerId: utils_1.Schema.StringRequired } },
        },
        getPeerCount: utils_1.reqEmpty,
        getNodeVersion: utils_1.reqEmpty,
        getSyncingStatus: utils_1.reqEmpty,
        getHealth: utils_1.reqEmpty,
    };
}
exports.getReqSerializers = getReqSerializers;
/* eslint-disable @typescript-eslint/naming-convention */
function getReturnTypes() {
    const stringType = new lodestar_types_1.StringType();
    const NetworkIdentity = new ssz_1.ContainerType({
        fields: {
            peerId: stringType,
            enr: stringType,
            p2pAddresses: (0, utils_1.ArrayOf)(stringType),
            discoveryAddresses: (0, utils_1.ArrayOf)(stringType),
            metadata: lodestar_types_1.ssz.altair.Metadata,
        },
        // From beacon apis
        casingMap: {
            peerId: "peer_id",
            enr: "enr",
            p2pAddresses: "p2p_addresses",
            discoveryAddresses: "discovery_addresses",
            metadata: "metadata",
        },
    });
    return {
        //
        // TODO: Consider just converting the JSON case without custom types
        //
        getNetworkIdentity: (0, utils_1.ContainerData)(NetworkIdentity),
        // All these types don't contain any BigInt nor Buffer instances.
        // Use jsonType() to translate the casing in a generic way.
        getPeers: (0, utils_1.jsonType)(),
        getPeer: (0, utils_1.jsonType)(),
        getPeerCount: (0, utils_1.jsonType)(),
        getNodeVersion: (0, utils_1.jsonType)(),
        getSyncingStatus: (0, utils_1.jsonType)(),
        getHealth: (0, utils_1.sameType)(),
    };
}
exports.getReturnTypes = getReturnTypes;
//# sourceMappingURL=node.js.map