"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncCommitteeService = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const util_1 = require("../util");
const syncCommitteeDuties_1 = require("./syncCommitteeDuties");
const utils_1 = require("./utils");
/**
 * Service that sets up and handles validator sync duties.
 */
class SyncCommitteeService {
    constructor(config, logger, api, clock, validatorStore, chainHeaderTracker, indicesService) {
        this.config = config;
        this.logger = logger;
        this.api = api;
        this.clock = clock;
        this.validatorStore = validatorStore;
        this.chainHeaderTracker = chainHeaderTracker;
        this.runSyncCommitteeTasks = async (slot, signal) => {
            try {
                // Before altair fork no need to check duties
                if ((0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot) < this.config.ALTAIR_FORK_EPOCH) {
                    return;
                }
                // Fetch info first so a potential delay is absorved by the sleep() below
                const dutiesAtSlot = await this.dutiesService.getDutiesAtSlot(slot);
                if (dutiesAtSlot.length === 0) {
                    return;
                }
                // Lighthouse recommends to always wait to 1/3 of the slot, even if the block comes early
                await (0, lodestar_utils_1.sleep)(this.clock.msToSlotFraction(slot, 1 / 3), signal);
                // Step 1. Download, sign and publish an `SyncCommitteeMessage` for each validator.
                //         Differs from AttestationService, `SyncCommitteeMessage` are equal for all
                const beaconBlockRoot = await this.produceAndPublishSyncCommittees(slot, dutiesAtSlot);
                // Step 2. If an attestation was produced, make an aggregate.
                // First, wait until the `aggregation_production_instant` (2/3rds of the way though the slot)
                await (0, lodestar_utils_1.sleep)(this.clock.msToSlotFraction(slot, 2 / 3), signal);
                // await for all so if the Beacon node is overloaded it auto-throttles
                // TODO: This approach is convervative to reduce the node's load, review
                const dutiesBySubcommitteeIndex = (0, utils_1.groupSyncDutiesBySubcommitteeIndex)(dutiesAtSlot);
                await Promise.all(Array.from(dutiesBySubcommitteeIndex.entries()).map(async ([subcommitteeIndex, duties]) => {
                    if (duties.length === 0)
                        return;
                    // Then download, sign and publish a `SignedAggregateAndProof` for each
                    // validator that is elected to aggregate for this `slot` and `subcommitteeIndex`.
                    await this.produceAndPublishAggregates(slot, subcommitteeIndex, beaconBlockRoot, duties).catch((e) => {
                        this.logger.error("Error on SyncCommitteeContribution", { slot, index: subcommitteeIndex }, e);
                    });
                }));
            }
            catch (e) {
                this.logger.error("Error on runSyncCommitteeTasks", { slot }, e);
            }
        };
        this.dutiesService = new syncCommitteeDuties_1.SyncCommitteeDutiesService(config, logger, api, clock, validatorStore, indicesService);
        // At most every slot, check existing duties from SyncCommitteeDutiesService and run tasks
        clock.runEverySlot(this.runSyncCommitteeTasks);
    }
    /**
     * Performs the first step of the attesting process: downloading `SyncCommittee` objects,
     * signing them and returning them to the validator.
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/validator.md#attesting
     *
     * Only one `SyncCommittee` is downloaded from the BN. It is then signed by each
     * validator and the list of individually-signed `SyncCommittee` objects is returned to the BN.
     */
    async produceAndPublishSyncCommittees(slot, duties) {
        const logCtx = { slot };
        // /eth/v1/beacon/blocks/:blockId/root -> at slot -1
        // Produce one attestation data per slot and subcommitteeIndex
        // Spec: the validator should prepare a SyncCommitteeMessage for the previous slot (slot - 1)
        // as soon as they have determined the head block of slot - 1
        let blockRoot = this.chainHeaderTracker.getCurrentChainHead(slot);
        if (blockRoot === null) {
            const blockRootData = await this.api.beacon.getBlockRoot("head").catch((e) => {
                throw (0, util_1.extendError)(e, "Error producing SyncCommitteeMessage");
            });
            blockRoot = blockRootData.data;
        }
        const signatures = [];
        for (const { duty } of duties) {
            const logCtxValidator = { ...logCtx, validatorIndex: duty.validatorIndex };
            try {
                signatures.push(await this.validatorStore.signSyncCommitteeSignature(duty.pubkey, duty.validatorIndex, slot, blockRoot));
                this.logger.debug("Signed SyncCommitteeMessage", logCtxValidator);
            }
            catch (e) {
                this.logger.error("Error signing SyncCommitteeMessage", logCtxValidator, e);
            }
        }
        if (signatures.length > 0) {
            try {
                await this.api.beacon.submitPoolSyncCommitteeSignatures(signatures);
                this.logger.info("Published SyncCommitteeMessage", { ...logCtx, count: signatures.length });
            }
            catch (e) {
                this.logger.error("Error publishing SyncCommitteeMessage", logCtx, e);
            }
        }
        return blockRoot;
    }
    /**
     * Performs the second step of the attesting process: downloading an aggregated `SyncCommittee`,
     * converting it into a `SignedAggregateAndProof` and returning it to the BN.
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/validator.md#broadcast-aggregate
     *
     * Only one aggregated `SyncCommittee` is downloaded from the BN. It is then signed
     * by each validator and the list of individually-signed `SignedAggregateAndProof` objects is
     * returned to the BN.
     */
    async produceAndPublishAggregates(slot, subcommitteeIndex, beaconBlockRoot, duties) {
        const logCtx = { slot, index: subcommitteeIndex };
        // No validator is aggregator, skip
        if (duties.every(({ selectionProof }) => selectionProof === null)) {
            return;
        }
        this.logger.verbose("Producing SyncCommitteeContribution", logCtx);
        const contribution = await this.api.validator
            .produceSyncCommitteeContribution(slot, subcommitteeIndex, beaconBlockRoot)
            .catch((e) => {
            throw (0, util_1.extendError)(e, "Error producing SyncCommitteeContribution");
        });
        const signedContributions = [];
        for (const { duty, selectionProof } of duties) {
            const logCtxValidator = { ...logCtx, validatorIndex: duty.validatorIndex };
            try {
                // Produce signed contributions only for validators that are subscribed aggregators.
                if (selectionProof !== null) {
                    signedContributions.push(await this.validatorStore.signContributionAndProof(duty, selectionProof, contribution.data));
                    this.logger.debug("Signed SyncCommitteeContribution", logCtxValidator);
                }
            }
            catch (e) {
                this.logger.error("Error signing SyncCommitteeContribution", logCtxValidator, e);
            }
        }
        if (signedContributions.length > 0) {
            try {
                await this.api.validator.publishContributionAndProofs(signedContributions);
                this.logger.info("Published SyncCommitteeContribution", { ...logCtx, count: signedContributions.length });
            }
            catch (e) {
                this.logger.error("Error publishing SyncCommitteeContribution", logCtx, e);
            }
        }
    }
}
exports.SyncCommitteeService = SyncCommitteeService;
//# sourceMappingURL=syncCommittee.js.map