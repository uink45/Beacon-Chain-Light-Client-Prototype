"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttestationDutiesService = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const ssz_1 = require("@chainsafe/ssz");
const util_1 = require("../util");
/** Only retain `HISTORICAL_DUTIES_EPOCHS` duties prior to the current epoch. */
const HISTORICAL_DUTIES_EPOCHS = 2;
class AttestationDutiesService {
    constructor(logger, api, clock, validatorStore, indicesService, chainHeadTracker) {
        this.logger = logger;
        this.api = api;
        this.clock = clock;
        this.validatorStore = validatorStore;
        this.indicesService = indicesService;
        /** Maps a validator public key to their duties for each epoch */
        this.dutiesByIndexByEpoch = new Map();
        /**
         * We may receive new dependentRoot of an epoch but it's not the last slot of epoch
         * so we have to wait for getting close to the next epoch to redownload new attesterDuties.
         */
        this.pendingDependentRootByEpoch = new Map();
        /**
         * If a reorg dependent root comes at a slot other than last slot of epoch
         * just update this.pendingDependentRootByEpoch() and process here
         */
        this.prepareForNextEpoch = async (slot) => {
            var _a;
            // only interested in last slot of epoch
            if ((slot + 1) % lodestar_params_1.SLOTS_PER_EPOCH !== 0) {
                return;
            }
            // during the 1 / 3 of epoch, last block of epoch may come
            await (0, lodestar_utils_1.sleep)(this.clock.msToSlotFraction(slot, 1 / 3));
            const nextEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot) + 1;
            const dependentRoot = (_a = this.dutiesByIndexByEpoch.get(nextEpoch)) === null || _a === void 0 ? void 0 : _a.dependentRoot;
            const pendingDependentRoot = this.pendingDependentRootByEpoch.get(nextEpoch);
            if (dependentRoot && pendingDependentRoot && dependentRoot !== pendingDependentRoot) {
                // this happens when pendingDependentRoot is not the last block of an epoch
                this.logger.info("Redownload attester duties when it's close to epoch boundary", { nextEpoch, slot });
                await this.handleAttesterDutiesReorg(nextEpoch, slot, dependentRoot, pendingDependentRoot);
            }
        };
        this.runDutiesTasks = async (epoch) => {
            await Promise.all([
                // Run pollBeaconAttesters immediately for all known local indices
                this.pollBeaconAttesters(epoch, this.indicesService.getAllLocalIndices()).catch((e) => {
                    this.logger.error("Error on poll attesters", { epoch }, e);
                }),
                // At the same time fetch any remaining unknown validator indices, then poll duties for those newIndices only
                this.indicesService
                    .pollValidatorIndices()
                    .then((newIndices) => this.pollBeaconAttesters(epoch, newIndices))
                    .catch((e) => {
                    this.logger.error("Error on poll indices and attesters", { epoch }, e);
                }),
            ]);
            // After both, prune
            this.pruneOldDuties(epoch);
        };
        /**
         * attester duties may be reorged due to 2 scenarios:
         *   1. node is syncing (for nextEpoch duties)
         *   2. node is reorged
         * previousDutyDependentRoot = get_block_root_at_slot(state, compute_start_slot_at_epoch(epoch - 1) - 1)
         *   => dependent root of current epoch
         * currentDutyDependentRoot = get_block_root_at_slot(state, compute_start_slot_at_epoch(epoch) - 1)
         *   => dependent root of next epoch
         */
        this.onNewHead = async ({ slot, head, previousDutyDependentRoot, currentDutyDependentRoot, }) => {
            var _a, _b, _c;
            const currentEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot);
            const nextEpoch = currentEpoch + 1;
            const nextTwoEpoch = currentEpoch + 2;
            const nextTwoEpochDependentRoot = (_a = this.dutiesByIndexByEpoch.get(currentEpoch + 2)) === null || _a === void 0 ? void 0 : _a.dependentRoot;
            // this may happen ONLY when node is syncing
            // it's safe to get attester duties at epoch n + 1 thanks to nextEpochShuffling cache
            // but it's an issue to request attester duties for epoch n + 2 as dependent root keeps changing while node is syncing
            // see https://github.com/ChainSafe/lodestar/issues/3211
            if (nextTwoEpochDependentRoot && head !== nextTwoEpochDependentRoot) {
                // last slot of epoch, we're sure it's the correct dependent root
                if ((slot + 1) % lodestar_params_1.SLOTS_PER_EPOCH === 0) {
                    this.logger.info("Next 2 epoch attester duties reorg", { slot, dutyEpoch: nextTwoEpoch, head });
                    await this.handleAttesterDutiesReorg(nextTwoEpoch, slot, nextTwoEpochDependentRoot, head);
                }
                else {
                    this.logger.debug("Potential next 2 epoch attester duties reorg", { slot, dutyEpoch: nextTwoEpoch, head });
                    // node may send adjacent onHead events while it's syncing
                    // wait for getting close to next epoch to make sure the dependRoot
                    this.pendingDependentRootByEpoch.set(nextTwoEpoch, head);
                }
            }
            // dependent root for next epoch changed
            const nextEpochDependentRoot = (_b = this.dutiesByIndexByEpoch.get(nextEpoch)) === null || _b === void 0 ? void 0 : _b.dependentRoot;
            if (nextEpochDependentRoot && currentDutyDependentRoot !== nextEpochDependentRoot) {
                this.logger.warn("Potential next epoch attester duties reorg", {
                    slot,
                    dutyEpoch: nextEpoch,
                    priorDependentRoot: nextEpochDependentRoot,
                    newDependentRoot: currentDutyDependentRoot,
                });
                await this.handleAttesterDutiesReorg(nextEpoch, slot, nextEpochDependentRoot, currentDutyDependentRoot);
            }
            // dependent root for current epoch changed
            const currentEpochDependentRoot = (_c = this.dutiesByIndexByEpoch.get(currentEpoch)) === null || _c === void 0 ? void 0 : _c.dependentRoot;
            if (currentEpochDependentRoot && currentEpochDependentRoot !== previousDutyDependentRoot) {
                this.logger.warn("Potential current epoch attester duties reorg", {
                    slot,
                    dutyEpoch: currentEpoch,
                    priorDependentRoot: currentEpochDependentRoot,
                    newDependentRoot: previousDutyDependentRoot,
                });
                await this.handleAttesterDutiesReorg(currentEpoch, slot, currentEpochDependentRoot, previousDutyDependentRoot);
            }
        };
        // Running this task every epoch is safe since a re-org of two epochs is very unlikely
        // TODO: If the re-org event is reliable consider re-running then
        clock.runEveryEpoch(this.runDutiesTasks);
        clock.runEverySlot(this.prepareForNextEpoch);
        chainHeadTracker.runOnNewHead(this.onNewHead);
    }
    /** Returns all `ValidatorDuty` for the given `slot` */
    getDutiesAtSlot(slot) {
        const epoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot);
        const duties = [];
        const epochDuties = this.dutiesByIndexByEpoch.get(epoch);
        if (epochDuties === undefined) {
            return duties;
        }
        for (const validatorDuty of epochDuties.dutiesByIndex.values()) {
            if (validatorDuty.duty.slot === slot) {
                duties.push(validatorDuty);
            }
        }
        return duties;
    }
    /**
     * Query the beacon node for attestation duties for any known validators.
     *
     * This function will perform (in the following order):
     *
     * 1. Poll for current-epoch duties and update the local duties map.
     * 2. As above, but for the next-epoch.
     * 3. Push out any attestation subnet subscriptions to the BN.
     * 4. Prune old entries from duties.
     */
    async pollBeaconAttesters(currentEpoch, indexArr) {
        var _a;
        const nextEpoch = currentEpoch + 1;
        // No need to bother the BN if we don't have any validators.
        if (indexArr.length === 0) {
            return;
        }
        for (const epoch of [currentEpoch, nextEpoch]) {
            // Download the duties and update the duties for the current and next epoch.
            await this.pollBeaconAttestersForEpoch(epoch, indexArr).catch((e) => {
                this.logger.error("Failed to download attester duties", { epoch }, e);
            });
        }
        const beaconCommitteeSubscriptions = [];
        // For this epoch and the next epoch, produce any beacon committee subscriptions.
        //
        // We are *always* pushing out subscriptions, even if we've subscribed before. This is
        // potentially excessive on the BN in normal cases, but it will help with fast re-subscriptions
        // if the BN goes offline or we swap to a different one.
        const indexSet = new Set(indexArr);
        for (const epoch of [currentEpoch, nextEpoch]) {
            const epochDuties = (_a = this.dutiesByIndexByEpoch.get(epoch)) === null || _a === void 0 ? void 0 : _a.dutiesByIndex;
            if (epochDuties) {
                for (const { duty, selectionProof } of epochDuties.values()) {
                    if (indexSet.has(duty.validatorIndex)) {
                        beaconCommitteeSubscriptions.push({
                            validatorIndex: duty.validatorIndex,
                            committeesAtSlot: duty.committeesAtSlot,
                            committeeIndex: duty.committeeIndex,
                            slot: duty.slot,
                            isAggregator: selectionProof !== null,
                        });
                    }
                }
            }
        }
        // If there are any subscriptions, push them out to the beacon node.
        if (beaconCommitteeSubscriptions.length > 0) {
            // TODO: Should log or throw?
            await this.api.validator.prepareBeaconCommitteeSubnet(beaconCommitteeSubscriptions).catch((e) => {
                throw (0, util_1.extendError)(e, "Failed to subscribe to beacon committee subnets");
            });
        }
    }
    /**
     * For the given `indexArr`, download the duties for the given `epoch` and store them in duties.
     */
    async pollBeaconAttestersForEpoch(epoch, indexArr) {
        var _a;
        // Don't fetch duties for epochs before genesis. However, should fetch epoch 0 duties at epoch -1
        if (epoch < 0) {
            return;
        }
        const attesterDuties = await this.api.validator.getAttesterDuties(epoch, indexArr).catch((e) => {
            throw (0, util_1.extendError)(e, "Failed to obtain attester duty");
        });
        const dependentRoot = (0, ssz_1.toHexString)(attesterDuties.dependentRoot);
        const relevantDuties = attesterDuties.data.filter((duty) => this.validatorStore.hasVotingPubkey((0, ssz_1.toHexString)(duty.pubkey)));
        this.logger.debug("Downloaded attester duties", {
            epoch,
            dependentRoot,
            count: relevantDuties.length,
        });
        const priorDependentRoot = (_a = this.dutiesByIndexByEpoch.get(epoch)) === null || _a === void 0 ? void 0 : _a.dependentRoot;
        const dependentRootChanged = priorDependentRoot !== undefined && priorDependentRoot !== dependentRoot;
        if (!priorDependentRoot || dependentRootChanged) {
            const dutiesByIndex = new Map();
            for (const duty of relevantDuties) {
                const dutyAndProof = await this.getDutyAndProof(duty);
                dutiesByIndex.set(duty.validatorIndex, dutyAndProof);
            }
            this.dutiesByIndexByEpoch.set(epoch, { dependentRoot, dutiesByIndex });
        }
        if (priorDependentRoot && dependentRootChanged) {
            this.logger.warn("Attester duties re-org. This may happen from time to time", {
                priorDependentRoot: priorDependentRoot,
                dependentRoot: dependentRoot,
                epoch,
            });
        }
    }
    async handleAttesterDutiesReorg(dutyEpoch, slot, oldDependentRoot, newDependentRoot) {
        const logContext = {
            dutyEpoch,
            slot,
            oldDependentRoot,
            newDependentRoot,
        };
        this.logger.debug("Redownload attester duties", logContext);
        await this.pollBeaconAttestersForEpoch(dutyEpoch, this.indicesService.getAllLocalIndices())
            .then(() => {
            this.pendingDependentRootByEpoch.delete(dutyEpoch);
        })
            .catch((e) => {
            this.logger.error("Failed to redownload attester duties when reorg happens", logContext, e);
        });
    }
    async getDutyAndProof(duty) {
        const selectionProof = await this.validatorStore.signAttestationSelectionProof(duty.pubkey, duty.slot);
        const isAggregator = (0, lodestar_beacon_state_transition_1.isAggregatorFromCommitteeLength)(duty.committeeLength, selectionProof);
        return {
            duty,
            // selectionProof === null is used to check if is aggregator
            selectionProof: isAggregator ? selectionProof : null,
        };
    }
    /** Run once per epoch to prune duties map */
    pruneOldDuties(currentEpoch) {
        for (const byEpochMap of [this.dutiesByIndexByEpoch, this.pendingDependentRootByEpoch]) {
            for (const epoch of byEpochMap.keys()) {
                if (epoch + HISTORICAL_DUTIES_EPOCHS < currentEpoch) {
                    byEpochMap.delete(epoch);
                }
            }
        }
    }
}
exports.AttestationDutiesService = AttestationDutiesService;
//# sourceMappingURL=attestationDuties.js.map