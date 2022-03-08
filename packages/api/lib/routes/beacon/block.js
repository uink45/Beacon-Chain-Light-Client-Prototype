"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnTypes = exports.getReqSerializers = exports.routesData = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const utils_1 = require("../../utils");
/**
 * Define javascript values for each route
 */
exports.routesData = {
    getBlock: { url: "/eth/v1/beacon/blocks/:blockId", method: "GET" },
    getBlockV2: { url: "/eth/v2/beacon/blocks/:blockId", method: "GET" },
    getBlockAttestations: { url: "/eth/v1/beacon/blocks/:blockId/attestations", method: "GET" },
    getBlockHeader: { url: "/eth/v1/beacon/headers/:blockId", method: "GET" },
    getBlockHeaders: { url: "/eth/v1/beacon/headers", method: "GET" },
    getBlockRoot: { url: "/eth/v1/beacon/blocks/:blockId/root", method: "GET" },
    publishBlock: { url: "/eth/v1/beacon/blocks", method: "POST" },
};
function getReqSerializers(config) {
    const blockIdOnlyReq = {
        writeReq: (blockId) => ({ params: { blockId } }),
        parseReq: ({ params }) => [params.blockId],
        schema: { params: { blockId: utils_1.Schema.StringRequired } },
    };
    // Compute block type from JSON payload. See https://github.com/ethereum/eth2.0-APIs/pull/142
    const getSignedBeaconBlockType = (data) => config.getForkTypes(data.message.slot).SignedBeaconBlock;
    const AllForksSignedBeaconBlock = {
        toJson: (data, opts) => getSignedBeaconBlockType(data).toJson(data, opts),
        fromJson: (data, opts) => getSignedBeaconBlockType(data).fromJson(data, opts),
    };
    return {
        getBlock: blockIdOnlyReq,
        getBlockV2: blockIdOnlyReq,
        getBlockAttestations: blockIdOnlyReq,
        getBlockHeader: blockIdOnlyReq,
        getBlockHeaders: {
            writeReq: (filters) => ({ query: { slot: filters === null || filters === void 0 ? void 0 : filters.slot, parent_root: filters === null || filters === void 0 ? void 0 : filters.parentRoot } }),
            parseReq: ({ query }) => [{ slot: query === null || query === void 0 ? void 0 : query.slot, parentRoot: query === null || query === void 0 ? void 0 : query.parent_root }],
            schema: { query: { slot: utils_1.Schema.Uint, parent_root: utils_1.Schema.String } },
        },
        getBlockRoot: blockIdOnlyReq,
        publishBlock: (0, utils_1.reqOnlyBody)(AllForksSignedBeaconBlock, utils_1.Schema.Object),
    };
}
exports.getReqSerializers = getReqSerializers;
function getReturnTypes() {
    const BeaconHeaderResType = new ssz_1.ContainerType({
        fields: {
            root: lodestar_types_1.ssz.Root,
            canonical: lodestar_types_1.ssz.Boolean,
            header: lodestar_types_1.ssz.phase0.SignedBeaconBlockHeader,
        },
        //from beacon apis
        expectedCase: "notransform",
    });
    return {
        getBlock: (0, utils_1.ContainerData)(lodestar_types_1.ssz.phase0.SignedBeaconBlock),
        // Teku returns fork as UPPERCASE
        getBlockV2: (0, utils_1.WithVersion)((fork) => lodestar_types_1.ssz[fork.toLowerCase()].SignedBeaconBlock),
        getBlockAttestations: (0, utils_1.ContainerData)((0, utils_1.ArrayOf)(lodestar_types_1.ssz.phase0.Attestation)),
        getBlockHeader: (0, utils_1.ContainerData)(BeaconHeaderResType),
        getBlockHeaders: (0, utils_1.ContainerData)((0, utils_1.ArrayOf)(BeaconHeaderResType)),
        getBlockRoot: (0, utils_1.ContainerData)(lodestar_types_1.ssz.Root),
    };
}
exports.getReturnTypes = getReturnTypes;
//# sourceMappingURL=block.js.map