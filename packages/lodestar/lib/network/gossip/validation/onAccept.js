"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGossipAcceptMetadataByType = void 0;
const ssz_1 = require("@chainsafe/ssz");
const interface_1 = require("../interface");
/**
 * Return succint but meaningful data about accepted gossip objects.
 * This data is logged at the debug level extremely frequently so it must be short.
 */
exports.getGossipAcceptMetadataByType = {
    [interface_1.GossipType.beacon_block]: (config, signedBlock) => ({
        slot: signedBlock.message.slot,
        root: (0, ssz_1.toHexString)(config.getForkTypes(signedBlock.message.slot).BeaconBlock.hashTreeRoot(signedBlock.message)),
    }),
    [interface_1.GossipType.beacon_aggregate_and_proof]: (config, aggregateAndProof) => {
        const { data } = aggregateAndProof.message.aggregate;
        return {
            slot: data.slot,
            index: data.index,
        };
    },
    [interface_1.GossipType.beacon_attestation]: (config, attestation, topic) => ({
        slot: attestation.data.slot,
        subnet: topic.subnet,
        index: attestation.data.index,
    }),
    [interface_1.GossipType.voluntary_exit]: (config, voluntaryExit) => ({
        validatorIndex: voluntaryExit.message.validatorIndex,
    }),
    [interface_1.GossipType.proposer_slashing]: (config, proposerSlashing) => ({
        proposerIndex: proposerSlashing.signedHeader1.message.proposerIndex,
    }),
    [interface_1.GossipType.attester_slashing]: (config, attesterSlashing) => ({
        slot1: attesterSlashing.attestation1.data.slot,
        slot2: attesterSlashing.attestation2.data.slot,
    }),
    [interface_1.GossipType.sync_committee_contribution_and_proof]: (config, contributionAndProof) => {
        const { contribution } = contributionAndProof.message;
        return {
            slot: contribution.slot,
            index: contribution.subcommitteeIndex,
        };
    },
    [interface_1.GossipType.sync_committee]: (config, syncCommitteeSignature, topic) => ({
        slot: syncCommitteeSignature.slot,
        subnet: topic.subnet,
    }),
};
//# sourceMappingURL=onAccept.js.map