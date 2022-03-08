"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnTypes = exports.getReqSerializers = exports.routesData = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const utils_1 = require("../../utils");
/**
 * Define javascript values for each route
 */
exports.routesData = {
    getPoolAttestations: { url: "/eth/v1/beacon/pool/attestations", method: "GET" },
    getPoolAttesterSlashings: { url: "/eth/v1/beacon/pool/attester_slashings", method: "GET" },
    getPoolProposerSlashings: { url: "/eth/v1/beacon/pool/proposer_slashings", method: "GET" },
    getPoolVoluntaryExits: { url: "/eth/v1/beacon/pool/voluntary_exits", method: "GET" },
    submitPoolAttestations: { url: "/eth/v1/beacon/pool/attestations", method: "POST" },
    submitPoolAttesterSlashing: { url: "/eth/v1/beacon/pool/attester_slashings", method: "POST" },
    submitPoolProposerSlashing: { url: "/eth/v1/beacon/pool/proposer_slashings", method: "POST" },
    submitPoolVoluntaryExit: { url: "/eth/v1/beacon/pool/voluntary_exits", method: "POST" },
    submitPoolSyncCommitteeSignatures: { url: "/eth/v1/beacon/pool/sync_committees", method: "POST" },
};
function getReqSerializers() {
    return {
        getPoolAttestations: {
            writeReq: (filters) => ({ query: { slot: filters === null || filters === void 0 ? void 0 : filters.slot, committee_index: filters === null || filters === void 0 ? void 0 : filters.committeeIndex } }),
            parseReq: ({ query }) => [{ slot: query.slot, committeeIndex: query.committee_index }],
            schema: { query: { slot: utils_1.Schema.Uint, committee_index: utils_1.Schema.Uint } },
        },
        getPoolAttesterSlashings: utils_1.reqEmpty,
        getPoolProposerSlashings: utils_1.reqEmpty,
        getPoolVoluntaryExits: utils_1.reqEmpty,
        submitPoolAttestations: (0, utils_1.reqOnlyBody)((0, utils_1.ArrayOf)(lodestar_types_1.ssz.phase0.Attestation), utils_1.Schema.ObjectArray),
        submitPoolAttesterSlashing: (0, utils_1.reqOnlyBody)(lodestar_types_1.ssz.phase0.AttesterSlashing, utils_1.Schema.Object),
        submitPoolProposerSlashing: (0, utils_1.reqOnlyBody)(lodestar_types_1.ssz.phase0.ProposerSlashing, utils_1.Schema.Object),
        submitPoolVoluntaryExit: (0, utils_1.reqOnlyBody)(lodestar_types_1.ssz.phase0.SignedVoluntaryExit, utils_1.Schema.Object),
        submitPoolSyncCommitteeSignatures: (0, utils_1.reqOnlyBody)((0, utils_1.ArrayOf)(lodestar_types_1.ssz.altair.SyncCommitteeMessage), utils_1.Schema.ObjectArray),
    };
}
exports.getReqSerializers = getReqSerializers;
function getReturnTypes() {
    return {
        getPoolAttestations: (0, utils_1.ContainerData)((0, utils_1.ArrayOf)(lodestar_types_1.ssz.phase0.Attestation)),
        getPoolAttesterSlashings: (0, utils_1.ContainerData)((0, utils_1.ArrayOf)(lodestar_types_1.ssz.phase0.AttesterSlashing)),
        getPoolProposerSlashings: (0, utils_1.ContainerData)((0, utils_1.ArrayOf)(lodestar_types_1.ssz.phase0.ProposerSlashing)),
        getPoolVoluntaryExits: (0, utils_1.ContainerData)((0, utils_1.ArrayOf)(lodestar_types_1.ssz.phase0.SignedVoluntaryExit)),
    };
}
exports.getReturnTypes = getReturnTypes;
//# sourceMappingURL=pool.js.map