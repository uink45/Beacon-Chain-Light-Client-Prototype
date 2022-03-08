"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorStore = exports.SignerType = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
const utils_1 = require("./utils");
const externalSignerClient_1 = require("../util/externalSignerClient");
var SignerType;
(function (SignerType) {
    SignerType[SignerType["Local"] = 0] = "Local";
    SignerType[SignerType["Remote"] = 1] = "Remote";
})(SignerType = exports.SignerType || (exports.SignerType = {}));
/**
 * Service that sets up and handles validator attester duties.
 */
class ValidatorStore {
    constructor(config, slashingProtection, signers, genesis) {
        this.config = config;
        this.slashingProtection = slashingProtection;
        this.validators = new Map();
        for (const signer of signers) {
            this.validators.set(getSignerPubkeyHex(signer), signer);
        }
        this.slashingProtection = slashingProtection;
        this.genesisValidatorsRoot = genesis.genesisValidatorsRoot;
    }
    /** Return true if there is at least 1 pubkey registered */
    hasSomeValidators() {
        return this.validators.size > 0;
    }
    votingPubkeys() {
        return Array.from(this.validators.keys());
    }
    hasVotingPubkey(pubkeyHex) {
        return this.validators.has(pubkeyHex);
    }
    async signBlock(pubkey, block, currentSlot) {
        // Make sure the block slot is not higher than the current slot to avoid potential attacks.
        if (block.slot > currentSlot) {
            throw Error(`Not signing block with slot ${block.slot} greater than current slot ${currentSlot}`);
        }
        const proposerDomain = this.config.getDomain(lodestar_params_1.DOMAIN_BEACON_PROPOSER, block.slot);
        const blockType = this.config.getForkTypes(block.slot).BeaconBlock;
        const signingRoot = (0, lodestar_beacon_state_transition_1.computeSigningRoot)(blockType, block, proposerDomain);
        await this.slashingProtection.checkAndInsertBlockProposal(pubkey, { slot: block.slot, signingRoot });
        return {
            message: block,
            signature: await this.getSignature(pubkey, signingRoot),
        };
    }
    async signRandao(pubkey, slot) {
        const epoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot);
        const randaoDomain = this.config.getDomain(lodestar_params_1.DOMAIN_RANDAO, slot);
        const randaoSigningRoot = (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.Epoch, epoch, randaoDomain);
        return await this.getSignature(pubkey, randaoSigningRoot);
    }
    async signAttestation(duty, attestationData, currentEpoch) {
        // Make sure the target epoch is not higher than the current epoch to avoid potential attacks.
        if (attestationData.target.epoch > currentEpoch) {
            throw Error(`Not signing attestation with target epoch ${attestationData.target.epoch} greater than current epoch ${currentEpoch}`);
        }
        this.validateAttestationDuty(duty, attestationData);
        const slot = (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(attestationData.target.epoch);
        const domain = this.config.getDomain(lodestar_params_1.DOMAIN_BEACON_ATTESTER, slot);
        const signingRoot = (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.phase0.AttestationData, attestationData, domain);
        await this.slashingProtection.checkAndInsertAttestation(duty.pubkey, {
            sourceEpoch: attestationData.source.epoch,
            targetEpoch: attestationData.target.epoch,
            signingRoot,
        });
        return {
            aggregationBits: (0, utils_1.getAggregationBits)(duty.committeeLength, duty.validatorCommitteeIndex),
            data: attestationData,
            signature: await this.getSignature(duty.pubkey, signingRoot),
        };
    }
    async signAggregateAndProof(duty, selectionProof, aggregate) {
        this.validateAttestationDuty(duty, aggregate.data);
        const aggregateAndProof = {
            aggregate,
            aggregatorIndex: duty.validatorIndex,
            selectionProof,
        };
        const domain = this.config.getDomain(lodestar_params_1.DOMAIN_AGGREGATE_AND_PROOF, aggregate.data.slot);
        const signingRoot = (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.phase0.AggregateAndProof, aggregateAndProof, domain);
        return {
            message: aggregateAndProof,
            signature: await this.getSignature(duty.pubkey, signingRoot),
        };
    }
    async signSyncCommitteeSignature(pubkey, validatorIndex, slot, beaconBlockRoot) {
        const domain = this.config.getDomain(lodestar_params_1.DOMAIN_SYNC_COMMITTEE, slot);
        const signingRoot = (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.Root, beaconBlockRoot, domain);
        return {
            slot,
            validatorIndex,
            beaconBlockRoot,
            signature: await this.getSignature(pubkey, signingRoot),
        };
    }
    async signContributionAndProof(duty, selectionProof, contribution) {
        const contributionAndProof = {
            contribution,
            aggregatorIndex: duty.validatorIndex,
            selectionProof,
        };
        const domain = this.config.getDomain(lodestar_params_1.DOMAIN_CONTRIBUTION_AND_PROOF, contribution.slot);
        const signingRoot = (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.altair.ContributionAndProof, contributionAndProof, domain);
        return {
            message: contributionAndProof,
            signature: await this.getSignature(duty.pubkey, signingRoot),
        };
    }
    async signAttestationSelectionProof(pubkey, slot) {
        const domain = this.config.getDomain(lodestar_params_1.DOMAIN_SELECTION_PROOF, slot);
        const signingRoot = (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.Slot, slot, domain);
        return await this.getSignature(pubkey, signingRoot);
    }
    async signSyncCommitteeSelectionProof(pubkey, slot, subcommitteeIndex) {
        const domain = this.config.getDomain(lodestar_params_1.DOMAIN_SYNC_COMMITTEE_SELECTION_PROOF, slot);
        const signingData = {
            slot,
            subcommitteeIndex: subcommitteeIndex,
        };
        const signingRoot = (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.altair.SyncAggregatorSelectionData, signingData, domain);
        return await this.getSignature(pubkey, signingRoot);
    }
    async signVoluntaryExit(pubkey, validatorIndex, exitEpoch) {
        const domain = this.config.getDomain(lodestar_params_1.DOMAIN_VOLUNTARY_EXIT, (0, lodestar_beacon_state_transition_1.computeStartSlotAtEpoch)(exitEpoch));
        const voluntaryExit = { epoch: exitEpoch, validatorIndex };
        const signingRoot = (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.phase0.VoluntaryExit, voluntaryExit, domain);
        return {
            message: voluntaryExit,
            signature: await this.getSignature(pubkey, signingRoot),
        };
    }
    async getSignature(pubkey, signingRoot) {
        // TODO: Refactor indexing to not have to run toHexString() on the pubkey every time
        const pubkeyHex = typeof pubkey === "string" ? pubkey : (0, ssz_1.toHexString)(pubkey);
        const signer = this.validators.get(pubkeyHex);
        if (!signer) {
            throw Error(`Validator pubkey ${pubkeyHex} not known`);
        }
        switch (signer.type) {
            case SignerType.Local:
                return signer.secretKey.sign(signingRoot).toBytes();
            case SignerType.Remote: {
                const signatureHex = await (0, externalSignerClient_1.externalSignerPostSignature)(signer.externalSignerUrl, pubkeyHex, (0, ssz_1.toHexString)(signingRoot));
                return (0, ssz_1.fromHexString)(signatureHex);
            }
        }
    }
    /** Prevent signing bad data sent by the Beacon node */
    validateAttestationDuty(duty, data) {
        if (duty.slot !== data.slot) {
            throw Error(`Inconsistent duties during signing: duty.slot ${duty.slot} != att.slot ${data.slot}`);
        }
        if (duty.committeeIndex != data.index) {
            throw Error(`Inconsistent duties during signing: duty.committeeIndex ${duty.committeeIndex} != att.committeeIndex ${data.index}`);
        }
    }
}
exports.ValidatorStore = ValidatorStore;
function getSignerPubkeyHex(signer) {
    switch (signer.type) {
        case SignerType.Local:
            return (0, ssz_1.toHexString)(signer.secretKey.toPublicKey().toBytes());
        case SignerType.Remote:
            return signer.pubkeyHex;
    }
}
//# sourceMappingURL=validatorStore.js.map