"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBeaconPoolApi = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const validation_1 = require("../../../../chain/validation");
const attesterSlashing_1 = require("../../../../chain/validation/attesterSlashing");
const proposerSlashing_1 = require("../../../../chain/validation/proposerSlashing");
const voluntaryExit_1 = require("../../../../chain/validation/voluntaryExit");
const syncCommittee_1 = require("../../../../chain/validation/syncCommittee");
const validatorMonitor_1 = require("../../../../metrics/validatorMonitor");
const ssz_1 = require("@chainsafe/ssz");
const errors_1 = require("../../../../chain/errors");
function getBeaconPoolApi({ chain, logger, metrics, network, }) {
    return {
        async getPoolAttestations(filters) {
            // Already filtered by slot
            let attestations = chain.aggregatedAttestationPool.getAll(filters === null || filters === void 0 ? void 0 : filters.slot);
            if ((filters === null || filters === void 0 ? void 0 : filters.committeeIndex) !== undefined) {
                attestations = attestations.filter((attestation) => filters.committeeIndex === attestation.data.index);
            }
            return { data: attestations };
        },
        async getPoolAttesterSlashings() {
            return { data: chain.opPool.getAllAttesterSlashings() };
        },
        async getPoolProposerSlashings() {
            return { data: chain.opPool.getAllProposerSlashings() };
        },
        async getPoolVoluntaryExits() {
            return { data: chain.opPool.getAllVoluntaryExits() };
        },
        async submitPoolAttestations(attestations) {
            const seenTimestampSec = Date.now() / 1000;
            const errors = [];
            await Promise.all(attestations.map(async (attestation, i) => {
                try {
                    const { indexedAttestation, subnet } = await (0, validation_1.validateGossipAttestation)(chain, attestation, null);
                    metrics === null || metrics === void 0 ? void 0 : metrics.registerUnaggregatedAttestation(validatorMonitor_1.OpSource.api, seenTimestampSec, indexedAttestation);
                    await Promise.all([
                        network.gossip.publishBeaconAttestation(attestation, subnet),
                        chain.attestationPool.add(attestation),
                    ]);
                }
                catch (e) {
                    errors.push(e);
                    logger.error(`Error on submitPoolAttestations [${i}]`, { slot: attestation.data.slot, index: attestation.data.index }, e);
                    if (e instanceof errors_1.AttestationError && e.action === errors_1.GossipAction.REJECT) {
                        const archivedPath = chain.persistInvalidSszObject("attestation", lodestar_types_1.ssz.phase0.Attestation.serialize(attestation), (0, ssz_1.toHexString)(lodestar_types_1.ssz.phase0.Attestation.hashTreeRoot(attestation)));
                        logger.debug("Submitted invalid attestation was written to", archivedPath);
                    }
                }
            }));
            if (errors.length > 1) {
                throw Error("Multiple errors on submitPoolAttestations\n" + errors.map((e) => e.message).join("\n"));
            }
            else if (errors.length === 1) {
                throw errors[0];
            }
        },
        async submitPoolAttesterSlashing(attesterSlashing) {
            await (0, attesterSlashing_1.validateGossipAttesterSlashing)(chain, attesterSlashing);
            chain.opPool.insertAttesterSlashing(attesterSlashing);
            await network.gossip.publishAttesterSlashing(attesterSlashing);
        },
        async submitPoolProposerSlashing(proposerSlashing) {
            await (0, proposerSlashing_1.validateGossipProposerSlashing)(chain, proposerSlashing);
            chain.opPool.insertProposerSlashing(proposerSlashing);
            await network.gossip.publishProposerSlashing(proposerSlashing);
        },
        async submitPoolVoluntaryExit(voluntaryExit) {
            await (0, voluntaryExit_1.validateGossipVoluntaryExit)(chain, voluntaryExit);
            chain.opPool.insertVoluntaryExit(voluntaryExit);
            await network.gossip.publishVoluntaryExit(voluntaryExit);
        },
        /**
         * POST `/eth/v1/beacon/pool/sync_committees`
         *
         * Submits sync committee signature objects to the node.
         * Sync committee signatures are not present in phase0, but are required for Altair networks.
         * If a sync committee signature is validated successfully the node MUST publish that sync committee signature on all applicable subnets.
         * If one or more sync committee signatures fail validation the node MUST return a 400 error with details of which sync committee signatures have failed, and why.
         *
         * https://github.com/ethereum/eth2.0-APIs/pull/135
         */
        async submitPoolSyncCommitteeSignatures(signatures) {
            // Fetch states for all slots of the `signatures`
            const slots = new Set();
            for (const signature of signatures) {
                slots.add(signature.slot);
            }
            // TODO: Fetch states at signature slots
            const state = chain.getHeadState();
            const errors = [];
            await Promise.all(signatures.map(async (signature, i) => {
                try {
                    const synCommittee = state.epochCtx.getIndexedSyncCommittee(signature.slot);
                    const indexesInCommittee = synCommittee.validatorIndexMap.get(signature.validatorIndex);
                    if (indexesInCommittee === undefined || indexesInCommittee.length === 0) {
                        return; // Not a sync committee member
                    }
                    // Verify signature only, all other data is very likely to be correct, since the `signature` object is created by this node.
                    // Worst case if `signature` is not valid, gossip peers will drop it and slightly downscore us.
                    await (0, syncCommittee_1.validateSyncCommitteeSigOnly)(chain, state, signature);
                    await Promise.all(indexesInCommittee.map(async (indexInCommittee) => {
                        // Sync committee subnet members are just sequential in the order they appear in SyncCommitteeIndexes array
                        const subnet = Math.floor(indexInCommittee / lodestar_params_1.SYNC_COMMITTEE_SUBNET_SIZE);
                        const indexInSubcommittee = indexInCommittee % lodestar_params_1.SYNC_COMMITTEE_SUBNET_SIZE;
                        chain.syncCommitteeMessagePool.add(subnet, signature, indexInSubcommittee);
                        await network.gossip.publishSyncCommitteeSignature(signature, subnet);
                    }));
                }
                catch (e) {
                    errors.push(e);
                    logger.error(`Error on submitPoolSyncCommitteeSignatures [${i}]`, { slot: signature.slot, validatorIndex: signature.validatorIndex }, e);
                    if (e instanceof errors_1.SyncCommitteeError && e.action === errors_1.GossipAction.REJECT) {
                        const archivedPath = chain.persistInvalidSszObject("syncCommittee", lodestar_types_1.ssz.altair.SyncCommitteeMessage.serialize(signature), (0, ssz_1.toHexString)(lodestar_types_1.ssz.altair.SyncCommitteeMessage.hashTreeRoot(signature)));
                        logger.debug("The submitted sync committee message was written to", archivedPath);
                    }
                }
            }));
            if (errors.length > 1) {
                throw Error("Multiple errors on publishAggregateAndProofs\n" + errors.map((e) => e.message).join("\n"));
            }
            else if (errors.length === 1) {
                throw errors[0];
            }
        },
    };
}
exports.getBeaconPoolApi = getBeaconPoolApi;
//# sourceMappingURL=index.js.map