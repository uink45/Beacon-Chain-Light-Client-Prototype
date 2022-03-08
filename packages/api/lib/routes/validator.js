"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnTypes = exports.getReqSerializers = exports.routesData = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const utils_1 = require("../utils");
/**
 * Define javascript values for each route
 */
exports.routesData = {
    getAttesterDuties: { url: "/eth/v1/validator/duties/attester/:epoch", method: "POST" },
    getProposerDuties: { url: "/eth/v1/validator/duties/proposer/:epoch", method: "GET" },
    getSyncCommitteeDuties: { url: "/eth/v1/validator/duties/sync/:epoch", method: "POST" },
    produceBlock: { url: "/eth/v1/validator/blocks/:slot", method: "GET" },
    produceBlockV2: { url: "/eth/v2/validator/blocks/:slot", method: "GET" },
    produceAttestationData: { url: "/eth/v1/validator/attestation_data", method: "GET" },
    produceSyncCommitteeContribution: { url: "/eth/v1/validator/sync_committee_contribution", method: "GET" },
    getAggregatedAttestation: { url: "/eth/v1/validator/aggregate_attestation", method: "GET" },
    publishAggregateAndProofs: { url: "/eth/v1/validator/aggregate_and_proofs", method: "POST" },
    publishContributionAndProofs: { url: "/eth/v1/validator/contribution_and_proofs", method: "POST" },
    prepareBeaconCommitteeSubnet: { url: "/eth/v1/validator/beacon_committee_subscriptions", method: "POST" },
    prepareSyncCommitteeSubnets: { url: "/eth/v1/validator/sync_committee_subscriptions", method: "POST" },
};
function getReqSerializers() {
    const BeaconCommitteeSubscription = new ssz_1.ContainerType({
        fields: {
            validatorIndex: lodestar_types_1.ssz.ValidatorIndex,
            committeeIndex: lodestar_types_1.ssz.CommitteeIndex,
            committeesAtSlot: lodestar_types_1.ssz.Slot,
            slot: lodestar_types_1.ssz.Slot,
            isAggregator: lodestar_types_1.ssz.Boolean,
        },
        // From beacon apis
        casingMap: {
            validatorIndex: "validator_index",
            committeeIndex: "committee_index",
            committeesAtSlot: "committees_at_slot",
            slot: "slot",
            isAggregator: "is_aggregator",
        },
    });
    const SyncCommitteeSubscription = new ssz_1.ContainerType({
        fields: {
            validatorIndex: lodestar_types_1.ssz.ValidatorIndex,
            syncCommitteeIndices: (0, utils_1.ArrayOf)(lodestar_types_1.ssz.CommitteeIndex),
            untilEpoch: lodestar_types_1.ssz.Epoch,
        },
        // From beacon apis
        casingMap: {
            validatorIndex: "validator_index",
            syncCommitteeIndices: "sync_committee_indices",
            untilEpoch: "until_epoch",
        },
    });
    const produceBlock = {
        writeReq: (slot, randaoReveal, grafitti) => ({
            params: { slot },
            query: { randao_reveal: (0, ssz_1.toHexString)(randaoReveal), grafitti },
        }),
        parseReq: ({ params, query }) => [params.slot, (0, ssz_1.fromHexString)(query.randao_reveal), query.grafitti],
        schema: {
            params: { slot: utils_1.Schema.UintRequired },
            query: { randao_reveal: utils_1.Schema.StringRequired, grafitti: utils_1.Schema.String },
        },
    };
    return {
        getAttesterDuties: {
            writeReq: (epoch, validatorIndexes) => ({ params: { epoch }, body: validatorIndexes }),
            parseReq: ({ params, body }) => [params.epoch, body],
            schema: {
                params: { epoch: utils_1.Schema.UintRequired },
                body: utils_1.Schema.UintArray,
            },
        },
        getProposerDuties: {
            writeReq: (epoch) => ({ params: { epoch } }),
            parseReq: ({ params }) => [params.epoch],
            schema: {
                params: { epoch: utils_1.Schema.UintRequired },
            },
        },
        getSyncCommitteeDuties: {
            writeReq: (epoch, validatorIndexes) => ({ params: { epoch }, body: validatorIndexes }),
            parseReq: ({ params, body }) => [params.epoch, body],
            schema: {
                params: { epoch: utils_1.Schema.UintRequired },
                body: utils_1.Schema.UintArray,
            },
        },
        produceBlock: produceBlock,
        produceBlockV2: produceBlock,
        produceAttestationData: {
            writeReq: (index, slot) => ({ query: { slot, committee_index: index } }),
            parseReq: ({ query }) => [query.committee_index, query.slot],
            schema: {
                query: { slot: utils_1.Schema.UintRequired, committee_index: utils_1.Schema.UintRequired },
            },
        },
        produceSyncCommitteeContribution: {
            writeReq: (slot, index, root) => ({
                query: { slot, subcommittee_index: index, beacon_block_root: (0, ssz_1.toHexString)(root) },
            }),
            parseReq: ({ query }) => [query.slot, query.subcommittee_index, (0, ssz_1.fromHexString)(query.beacon_block_root)],
            schema: {
                query: {
                    slot: utils_1.Schema.UintRequired,
                    subcommittee_index: utils_1.Schema.UintRequired,
                    beacon_block_root: utils_1.Schema.StringRequired,
                },
            },
        },
        getAggregatedAttestation: {
            writeReq: (root, slot) => ({ query: { attestation_data_root: (0, ssz_1.toHexString)(root), slot } }),
            parseReq: ({ query }) => [(0, ssz_1.fromHexString)(query.attestation_data_root), query.slot],
            schema: {
                query: { attestation_data_root: utils_1.Schema.StringRequired, slot: utils_1.Schema.UintRequired },
            },
        },
        publishAggregateAndProofs: (0, utils_1.reqOnlyBody)((0, utils_1.ArrayOf)(lodestar_types_1.ssz.phase0.SignedAggregateAndProof), utils_1.Schema.ObjectArray),
        publishContributionAndProofs: (0, utils_1.reqOnlyBody)((0, utils_1.ArrayOf)(lodestar_types_1.ssz.altair.SignedContributionAndProof), utils_1.Schema.ObjectArray),
        prepareBeaconCommitteeSubnet: (0, utils_1.reqOnlyBody)((0, utils_1.ArrayOf)(BeaconCommitteeSubscription), utils_1.Schema.ObjectArray),
        prepareSyncCommitteeSubnets: (0, utils_1.reqOnlyBody)((0, utils_1.ArrayOf)(SyncCommitteeSubscription), utils_1.Schema.ObjectArray),
    };
}
exports.getReqSerializers = getReqSerializers;
function getReturnTypes() {
    const WithDependentRoot = (dataType) => new ssz_1.ContainerType({ fields: { data: dataType, dependentRoot: lodestar_types_1.ssz.Root } });
    const AttesterDuty = new ssz_1.ContainerType({
        fields: {
            pubkey: lodestar_types_1.ssz.BLSPubkey,
            validatorIndex: lodestar_types_1.ssz.ValidatorIndex,
            committeeIndex: lodestar_types_1.ssz.CommitteeIndex,
            committeeLength: lodestar_types_1.ssz.Number64,
            committeesAtSlot: lodestar_types_1.ssz.Number64,
            validatorCommitteeIndex: lodestar_types_1.ssz.Number64,
            slot: lodestar_types_1.ssz.Slot,
        },
        // From beacon apis
        casingMap: {
            pubkey: "pubkey",
            validatorIndex: "validator_index",
            committeeIndex: "committee_index",
            committeeLength: "committee_length",
            committeesAtSlot: "committees_at_slot",
            validatorCommitteeIndex: "validator_committee_index",
            slot: "slot",
        },
    });
    const ProposerDuty = new ssz_1.ContainerType({
        fields: {
            slot: lodestar_types_1.ssz.Slot,
            validatorIndex: lodestar_types_1.ssz.ValidatorIndex,
            pubkey: lodestar_types_1.ssz.BLSPubkey,
        },
        // From beacon apis
        casingMap: {
            slot: "slot",
            validatorIndex: "validator_index",
            pubkey: "pubkey",
        },
    });
    const SyncDuty = new ssz_1.ContainerType({
        fields: {
            pubkey: lodestar_types_1.ssz.BLSPubkey,
            validatorIndex: lodestar_types_1.ssz.ValidatorIndex,
            validatorSyncCommitteeIndices: (0, utils_1.ArrayOf)(lodestar_types_1.ssz.Number64),
        },
        // From beacon apis
        casingMap: {
            pubkey: "pubkey",
            validatorIndex: "validator_index",
            validatorSyncCommitteeIndices: "validator_sync_committee_indices",
        },
    });
    return {
        getAttesterDuties: WithDependentRoot((0, utils_1.ArrayOf)(AttesterDuty)),
        getProposerDuties: WithDependentRoot((0, utils_1.ArrayOf)(ProposerDuty)),
        getSyncCommitteeDuties: WithDependentRoot((0, utils_1.ArrayOf)(SyncDuty)),
        produceBlock: (0, utils_1.ContainerData)(lodestar_types_1.ssz.phase0.BeaconBlock),
        produceBlockV2: (0, utils_1.WithVersion)((fork) => lodestar_types_1.ssz[fork].BeaconBlock),
        produceAttestationData: (0, utils_1.ContainerData)(lodestar_types_1.ssz.phase0.AttestationData),
        produceSyncCommitteeContribution: (0, utils_1.ContainerData)(lodestar_types_1.ssz.altair.SyncCommitteeContribution),
        getAggregatedAttestation: (0, utils_1.ContainerData)(lodestar_types_1.ssz.phase0.Attestation),
    };
}
exports.getReturnTypes = getReturnTypes;
//# sourceMappingURL=validator.js.map