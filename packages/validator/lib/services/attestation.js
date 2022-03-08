"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttestationService = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const util_1 = require("../util");
const attestationDuties_1 = require("./attestationDuties");
const utils_1 = require("./utils");
const ssz_1 = require("@chainsafe/ssz");
const emitter_1 = require("./emitter");
/**
 * Service that sets up and handles validator attester duties.
 */
class AttestationService {
    constructor(logger, api, clock, validatorStore, emitter, indicesService, chainHeadTracker) {
        this.logger = logger;
        this.api = api;
        this.clock = clock;
        this.validatorStore = validatorStore;
        this.emitter = emitter;
        this.runAttestationTasks = async (slot, signal) => {
            // Fetch info first so a potential delay is absorved by the sleep() below
            const dutiesByCommitteeIndex = (0, utils_1.groupAttDutiesByCommitteeIndex)(this.dutiesService.getDutiesAtSlot(slot));
            // A validator should create and broadcast the attestation to the associated attestation subnet when either
            // (a) the validator has received a valid block from the expected block proposer for the assigned slot or
            // (b) one-third of the slot has transpired (SECONDS_PER_SLOT / 3 seconds after the start of slot) -- whichever comes first.
            await Promise.race([(0, lodestar_utils_1.sleep)(this.clock.msToSlotFraction(slot, 1 / 3), signal), this.waitForBlockSlot(slot)]);
            // await for all so if the Beacon node is overloaded it auto-throttles
            // TODO: This approach is convervative to reduce the node's load, review
            await Promise.all(Array.from(dutiesByCommitteeIndex.entries()).map(async ([committeeIndex, duties]) => {
                if (duties.length === 0)
                    return;
                await this.publishAttestationsAndAggregates(slot, committeeIndex, duties, signal).catch((e) => {
                    this.logger.error("Error on attestations routine", { slot, committeeIndex }, e);
                });
            }));
        };
        this.dutiesService = new attestationDuties_1.AttestationDutiesService(logger, api, clock, validatorStore, indicesService, chainHeadTracker);
        // At most every slot, check existing duties from AttestationDutiesService and run tasks
        clock.runEverySlot(this.runAttestationTasks);
    }
    waitForBlockSlot(slot) {
        let headListener;
        const onDone = () => {
            this.emitter.off(emitter_1.ValidatorEvent.chainHead, headListener);
        };
        return new Promise((resolve) => {
            headListener = (head) => {
                if (head.slot >= slot) {
                    onDone();
                    resolve();
                }
            };
            this.emitter.on(emitter_1.ValidatorEvent.chainHead, headListener);
        });
    }
    async publishAttestationsAndAggregates(slot, committeeIndex, duties, signal) {
        // Step 1. Download, sign and publish an `Attestation` for each validator.
        const attestation = await this.produceAndPublishAttestations(slot, committeeIndex, duties);
        // Step 2. If an attestation was produced, make an aggregate.
        // First, wait until the `aggregation_production_instant` (2/3rds of the way though the slot)
        await (0, lodestar_utils_1.sleep)(this.clock.msToSlotFraction(slot, 2 / 3), signal);
        // Then download, sign and publish a `SignedAggregateAndProof` for each
        // validator that is elected to aggregate for this `slot` and
        // `committeeIndex`.
        await this.produceAndPublishAggregates(attestation, duties);
    }
    /**
     * Performs the first step of the attesting process: downloading `Attestation` objects,
     * signing them and returning them to the validator.
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/validator.md#attesting
     *
     * Only one `Attestation` is downloaded from the BN. It is then signed by each
     * validator and the list of individually-signed `Attestation` objects is returned to the BN.
     */
    async produceAndPublishAttestations(slot, committeeIndex, duties) {
        const logCtx = { slot, index: committeeIndex };
        // Produce one attestation data per slot and committeeIndex
        const attestationRes = await this.api.validator.produceAttestationData(committeeIndex, slot).catch((e) => {
            throw (0, util_1.extendError)(e, "Error producing attestation");
        });
        const attestation = attestationRes.data;
        const currentEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot);
        const signedAttestations = [];
        for (const { duty } of duties) {
            const logCtxValidator = {
                ...logCtx,
                head: (0, ssz_1.toHexString)(attestation.beaconBlockRoot),
                validatorIndex: duty.validatorIndex,
            };
            try {
                signedAttestations.push(await this.validatorStore.signAttestation(duty, attestation, currentEpoch));
                this.logger.debug("Signed attestation", logCtxValidator);
            }
            catch (e) {
                this.logger.error("Error signing attestation", logCtxValidator, e);
            }
        }
        if (signedAttestations.length > 0) {
            try {
                await this.api.beacon.submitPoolAttestations(signedAttestations);
                this.logger.info("Published attestations", { ...logCtx, count: signedAttestations.length });
            }
            catch (e) {
                this.logger.error("Error publishing attestations", logCtx, e);
            }
        }
        return attestation;
    }
    /**
     * Performs the second step of the attesting process: downloading an aggregated `Attestation`,
     * converting it into a `SignedAggregateAndProof` and returning it to the BN.
     *
     * https://github.com/ethereum/eth2.0-specs/blob/v0.12.1/specs/phase0/validator.md#broadcast-aggregate
     *
     * Only one aggregated `Attestation` is downloaded from the BN. It is then signed
     * by each validator and the list of individually-signed `SignedAggregateAndProof` objects is
     * returned to the BN.
     */
    async produceAndPublishAggregates(attestation, duties) {
        const logCtx = { slot: attestation.slot, index: attestation.index };
        // No validator is aggregator, skip
        if (duties.every(({ selectionProof }) => selectionProof === null)) {
            return;
        }
        this.logger.verbose("Aggregating attestations", logCtx);
        const aggregate = await this.api.validator
            .getAggregatedAttestation(lodestar_types_1.ssz.phase0.AttestationData.hashTreeRoot(attestation), attestation.slot)
            .catch((e) => {
            throw (0, util_1.extendError)(e, "Error producing aggregateAndProofs");
        });
        const signedAggregateAndProofs = [];
        for (const { duty, selectionProof } of duties) {
            const logCtxValidator = { ...logCtx, validator: (0, ssz_1.toHexString)(duty.pubkey), validatorIndex: duty.validatorIndex };
            try {
                // Produce signed aggregates only for validators that are subscribed aggregators.
                if (selectionProof !== null) {
                    signedAggregateAndProofs.push(await this.validatorStore.signAggregateAndProof(duty, selectionProof, aggregate.data));
                    this.logger.debug("Signed aggregateAndProofs", logCtxValidator);
                }
            }
            catch (e) {
                this.logger.error("Error signing aggregateAndProofs", logCtxValidator, e);
            }
        }
        if (signedAggregateAndProofs.length > 0) {
            try {
                await this.api.validator.publishAggregateAndProofs(signedAggregateAndProofs);
                this.logger.info("Published aggregateAndProofs", { ...logCtx, count: signedAggregateAndProofs.length });
            }
            catch (e) {
                this.logger.error("Error publishing aggregateAndProofs", logCtx, e);
            }
        }
    }
}
exports.AttestationService = AttestationService;
//# sourceMappingURL=attestation.js.map