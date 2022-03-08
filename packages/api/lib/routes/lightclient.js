"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnTypes = exports.getReqSerializers = exports.routesData = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const utils_1 = require("../utils");
const serdes_1 = require("../utils/serdes");
/**
 * Define javascript values for each route
 */
exports.routesData = {
    getStateProof: { url: "/eth/v1/lightclient/proof/:stateId", method: "GET" },
    getCommitteeUpdates: { url: "/eth/v1/lightclient/committee_updates", method: "GET" },
    getHeadUpdate: { url: "/eth/v1/lightclient/head_update/", method: "GET" },
    getHeadUpdateBySlot: { url: "/eth/v1/lightclient/head_update_by_slot/:slot", method: "GET" },
    getSnapshot: { url: "/eth/v1/lightclient/snapshot/:blockRoot", method: "GET" },
};
function getReqSerializers() {
    return {
        getStateProof: {
            writeReq: (stateId, paths) => ({ params: { stateId }, query: { paths: (0, serdes_1.querySerializeProofPathsArr)(paths) } }),
            parseReq: ({ params, query }) => [params.stateId, (0, serdes_1.queryParseProofPathsArr)(query.paths)],
            schema: { params: { stateId: utils_1.Schema.StringRequired }, body: utils_1.Schema.AnyArray },
        },
        getCommitteeUpdates: {
            writeReq: (from, to) => ({ query: { from, to } }),
            parseReq: ({ query }) => [query.from, query.to],
            schema: { query: { from: utils_1.Schema.UintRequired, to: utils_1.Schema.UintRequired } },
        },
        getHeadUpdate: utils_1.reqEmpty,
        getHeadUpdateBySlot: {
            writeReq: (slot) => ({ params: { slot } }),
            parseReq: ({ params }) => [params.slot],
            schema: { params: { slot: utils_1.Schema.StringRequired } },
        },
        getSnapshot: {
            writeReq: (blockRoot) => ({ params: { blockRoot } }),
            parseReq: ({ params }) => [params.blockRoot],
            schema: { params: { blockRoot: utils_1.Schema.StringRequired } },
        },
    };
}
exports.getReqSerializers = getReqSerializers;
function getReturnTypes() {
    const lightclientSnapshotWithProofType = new ssz_1.ContainerType({
        fields: {
            header: lodestar_types_1.ssz.phase0.BeaconBlockHeader,
            currentSyncCommittee: lodestar_types_1.ssz.altair.SyncCommittee,
            currentSyncCommitteeBranch: new ssz_1.VectorType({ elementType: lodestar_types_1.ssz.Root, length: 5 }),
        },
        // Custom type, not in the consensus specs
        casingMap: {
            header: "header",
            currentSyncCommittee: "current_sync_committee",
            currentSyncCommitteeBranch: "current_sync_committee_branch",
        },
    });
    const lightclientHeaderUpdate = new ssz_1.ContainerType({
        fields: {
            syncAggregate: lodestar_types_1.ssz.altair.SyncAggregate,
            attestedHeader: lodestar_types_1.ssz.phase0.BeaconBlockHeader,
        },
        casingMap: {
            syncAggregate: "sync_aggregate",
            attestedHeader: "attested_header",
        },
    });
    return {
        // Just sent the proof JSON as-is
        getStateProof: (0, utils_1.sameType)(),
        getCommitteeUpdates: (0, utils_1.ContainerData)((0, utils_1.ArrayOf)(lodestar_types_1.ssz.altair.LightClientUpdate)),
        getHeadUpdate: (0, utils_1.ContainerData)(lightclientHeaderUpdate),
        getHeadUpdateBySlot: (0, utils_1.ContainerData)(lightclientHeaderUpdate),
        getSnapshot: (0, utils_1.ContainerData)(lightclientSnapshotWithProofType),
    };
}
exports.getReturnTypes = getReturnTypes;
//# sourceMappingURL=lightclient.js.map