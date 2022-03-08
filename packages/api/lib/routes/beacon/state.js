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
    getEpochCommittees: { url: "/eth/v1/beacon/states/:stateId/committees", method: "GET" },
    getEpochSyncCommittees: { url: "/eth/v1/beacon/states/:stateId/sync_committees", method: "GET" },
    getStateFinalityCheckpoints: { url: "/eth/v1/beacon/states/:stateId/finality_checkpoints", method: "GET" },
    getStateFork: { url: "/eth/v1/beacon/states/:stateId/fork", method: "GET" },
    getStateRoot: { url: "/eth/v1/beacon/states/:stateId/root", method: "GET" },
    getStateValidator: { url: "/eth/v1/beacon/states/:stateId/validators/:validatorId", method: "GET" },
    getStateValidators: { url: "/eth/v1/beacon/states/:stateId/validators", method: "GET" },
    getStateValidatorBalances: { url: "/eth/v1/beacon/states/:stateId/validator_balances", method: "GET" },
};
function getReqSerializers() {
    const stateIdOnlyReq = {
        writeReq: (stateId) => ({ params: { stateId } }),
        parseReq: ({ params }) => [params.stateId],
        schema: { params: { stateId: utils_1.Schema.StringRequired } },
    };
    return {
        getEpochCommittees: {
            writeReq: (stateId, filters) => ({ params: { stateId }, query: filters || {} }),
            parseReq: ({ params, query }) => [params.stateId, query],
            schema: {
                params: { stateId: utils_1.Schema.StringRequired },
                query: { slot: utils_1.Schema.Uint, epoch: utils_1.Schema.Uint, index: utils_1.Schema.Uint },
            },
        },
        getEpochSyncCommittees: {
            writeReq: (stateId, epoch) => ({ params: { stateId }, query: { epoch } }),
            parseReq: ({ params, query }) => [params.stateId, query.epoch],
            schema: {
                params: { stateId: utils_1.Schema.StringRequired },
                query: { epoch: utils_1.Schema.Uint },
            },
        },
        getStateFinalityCheckpoints: stateIdOnlyReq,
        getStateFork: stateIdOnlyReq,
        getStateRoot: stateIdOnlyReq,
        getStateValidator: {
            writeReq: (stateId, validatorId) => ({ params: { stateId, validatorId } }),
            parseReq: ({ params }) => [params.stateId, params.validatorId],
            schema: {
                params: { stateId: utils_1.Schema.StringRequired, validatorId: utils_1.Schema.StringRequired },
            },
        },
        getStateValidators: {
            writeReq: (stateId, filters) => ({ params: { stateId }, query: filters || {} }),
            parseReq: ({ params, query }) => [params.stateId, query],
            schema: {
                params: { stateId: utils_1.Schema.StringRequired },
                query: { indices: utils_1.Schema.UintOrStringArray, statuses: utils_1.Schema.StringArray },
            },
        },
        getStateValidatorBalances: {
            writeReq: (stateId, indices) => ({ params: { stateId }, query: { indices } }),
            parseReq: ({ params, query }) => [params.stateId, query.indices],
            schema: {
                params: { stateId: utils_1.Schema.StringRequired },
                query: { indices: utils_1.Schema.UintOrStringArray },
            },
        },
    };
}
exports.getReqSerializers = getReqSerializers;
/* eslint-disable @typescript-eslint/naming-convention */
function getReturnTypes() {
    const FinalityCheckpoints = new ssz_1.ContainerType({
        fields: {
            previousJustified: lodestar_types_1.ssz.phase0.Checkpoint,
            currentJustified: lodestar_types_1.ssz.phase0.Checkpoint,
            finalized: lodestar_types_1.ssz.phase0.Checkpoint,
        },
        // From beacon apis
        casingMap: {
            previousJustified: "previous_justified",
            currentJustified: "current_justified",
            finalized: "finalized",
        },
    });
    const ValidatorResponse = new ssz_1.ContainerType({
        fields: {
            index: lodestar_types_1.ssz.ValidatorIndex,
            balance: lodestar_types_1.ssz.Number64,
            status: new lodestar_types_1.StringType(),
            validator: lodestar_types_1.ssz.phase0.Validator,
        },
        // From beacon apis
        expectedCase: "notransform",
    });
    const ValidatorBalance = new ssz_1.ContainerType({
        fields: {
            index: lodestar_types_1.ssz.ValidatorIndex,
            balance: lodestar_types_1.ssz.Number64,
        },
        // From beacon apis
        expectedCase: "notransform",
    });
    const EpochCommitteeResponse = new ssz_1.ContainerType({
        fields: {
            index: lodestar_types_1.ssz.CommitteeIndex,
            slot: lodestar_types_1.ssz.Slot,
            validators: lodestar_types_1.ssz.phase0.CommitteeIndices,
        },
    });
    const EpochSyncCommitteesResponse = new ssz_1.ContainerType({
        fields: {
            validators: (0, utils_1.ArrayOf)(lodestar_types_1.ssz.ValidatorIndex),
            validatorAggregates: (0, utils_1.ArrayOf)(lodestar_types_1.ssz.ValidatorIndex),
        },
    });
    return {
        getStateRoot: (0, utils_1.ContainerData)(lodestar_types_1.ssz.Root),
        getStateFork: (0, utils_1.ContainerData)(lodestar_types_1.ssz.phase0.Fork),
        getStateFinalityCheckpoints: (0, utils_1.ContainerData)(FinalityCheckpoints),
        getStateValidators: (0, utils_1.ContainerData)((0, utils_1.ArrayOf)(ValidatorResponse)),
        getStateValidator: (0, utils_1.ContainerData)(ValidatorResponse),
        getStateValidatorBalances: (0, utils_1.ContainerData)((0, utils_1.ArrayOf)(ValidatorBalance)),
        getEpochCommittees: (0, utils_1.ContainerData)((0, utils_1.ArrayOf)(EpochCommitteeResponse)),
        getEpochSyncCommittees: (0, utils_1.ContainerData)(EpochSyncCommitteesResponse),
    };
}
exports.getReturnTypes = getReturnTypes;
//# sourceMappingURL=state.js.map