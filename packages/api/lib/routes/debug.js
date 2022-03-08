"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnTypes = exports.getReqSerializers = exports.routesData = exports.mimeTypeSSZ = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
const utils_1 = require("../utils");
exports.mimeTypeSSZ = "application/octet-stream";
exports.routesData = {
    getHeads: { url: "/eth/v1/debug/beacon/heads", method: "GET" },
    getState: { url: "/eth/v1/debug/beacon/states/:stateId", method: "GET" },
    getStateV2: { url: "/eth/v2/debug/beacon/states/:stateId", method: "GET" },
    connectToPeer: { url: "/eth/v1/debug/connect/:peerId", method: "POST" },
    disconnectPeer: { url: "/eth/v1/debug/disconnect/:peerId", method: "POST" },
};
function getReqSerializers() {
    const getState = {
        writeReq: (stateId, format) => ({
            params: { stateId },
            headers: { accept: format === "ssz" ? exports.mimeTypeSSZ : "" },
        }),
        parseReq: ({ params, headers }) => [params.stateId, headers.accept === exports.mimeTypeSSZ ? "ssz" : "json"],
        schema: { params: { stateId: utils_1.Schema.StringRequired } },
    };
    return {
        getHeads: utils_1.reqEmpty,
        getState: getState,
        getStateV2: getState,
        connectToPeer: {
            writeReq: (peerId, multiaddr) => ({ params: { peerId }, body: multiaddr }),
            parseReq: ({ params, body }) => [params.peerId, body],
            schema: { params: { peerId: utils_1.Schema.StringRequired }, body: utils_1.Schema.StringArray },
        },
        disconnectPeer: {
            writeReq: (peerId) => ({ params: { peerId } }),
            parseReq: ({ params }) => [params.peerId],
            schema: { params: { peerId: utils_1.Schema.StringRequired } },
        },
    };
}
exports.getReqSerializers = getReqSerializers;
/* eslint-disable @typescript-eslint/naming-convention */
function getReturnTypes() {
    const stringType = new lodestar_types_1.StringType();
    const SlotRoot = new ssz_1.ContainerType({
        fields: {
            slot: lodestar_types_1.ssz.Slot,
            root: stringType,
        },
        // From beacon apis
        expectedCase: "notransform",
    });
    return {
        getHeads: (0, utils_1.ContainerData)((0, utils_1.ArrayOf)(SlotRoot)),
        getState: (0, utils_1.ContainerData)(lodestar_types_1.ssz.phase0.BeaconState),
        // Teku returns fork as UPPERCASE
        getStateV2: (0, utils_1.WithVersion)((fork) => lodestar_types_1.ssz[fork.toLowerCase()].BeaconState),
    };
}
exports.getReturnTypes = getReturnTypes;
//# sourceMappingURL=debug.js.map