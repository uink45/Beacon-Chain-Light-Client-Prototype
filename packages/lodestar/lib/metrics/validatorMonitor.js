"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidatorMonitor = exports.OpSource = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
/** The validator monitor collects per-epoch data about each monitored validator.
 * Historical data will be kept around for `HISTORIC_EPOCHS` before it is pruned.
 */
const HISTORIC_EPOCHS = 4;
var OpSource;
(function (OpSource) {
    OpSource["api"] = "api";
    OpSource["gossip"] = "gossip";
})(OpSource = exports.OpSource || (exports.OpSource = {}));
function statusToSummary(status) {
    const flags = (0, lodestar_beacon_state_transition_1.parseAttesterFlags)(status.flags);
    return {
        isSlashed: flags.unslashed,
        isActiveInCurrentEpoch: status.active,
        isActiveInPreviousEpoch: status.active,
        // TODO: Implement
        currentEpochEffectiveBalance: 0,
        isPrevSourceAttester: flags.prevSourceAttester,
        isPrevTargetAttester: flags.prevTargetAttester,
        isPrevHeadAttester: flags.prevHeadAttester,
        isCurrSourceAttester: flags.currSourceAttester,
        isCurrTargetAttester: flags.currTargetAttester,
        isCurrHeadAttester: flags.currHeadAttester,
        inclusionDistance: status.inclusionDelay,
    };
}
function withEpochSummary(validator, epoch, fn) {
    let summary = validator.summaries.get(epoch);
    if (!summary) {
        summary = {
            attestations: 0,
            attestationMinDelay: null,
            attestationAggregateIncusions: 0,
            attestationBlockInclusions: 0,
            attestationMinBlockInclusionDistance: null,
            blocks: 0,
            blockMinDelay: null,
            aggregates: 0,
            aggregateMinDelay: null,
            attestationCorrectHead: null,
        };
        validator.summaries.set(epoch, summary);
    }
    fn(summary);
    // Prune
    const toPrune = validator.summaries.size - HISTORIC_EPOCHS;
    if (toPrune > 0) {
        let pruned = 0;
        for (const idx of validator.summaries.keys()) {
            validator.summaries.delete(idx);
            if (++pruned >= toPrune)
                break;
        }
    }
}
function createValidatorMonitor(metrics, config, genesisTime) {
    /** The validators that require additional monitoring. */
    const validators = new Map();
    let lastRegisteredStatusEpoch = -1;
    return {
        registerLocalValidator(index) {
            if (!validators.has(index)) {
                validators.set(index, { index, summaries: new Map() });
            }
        },
        registerValidatorStatuses(currentEpoch, statuses, balances) {
            // Prevent registering status for the same epoch twice. processEpoch() may be ran more than once for the same epoch.
            if (currentEpoch <= lastRegisteredStatusEpoch) {
                return;
            }
            lastRegisteredStatusEpoch = currentEpoch;
            const previousEpoch = currentEpoch - 1;
            for (const monitoredValidator of validators.values()) {
                // We subtract two from the state of the epoch that generated these summaries.
                //
                // - One to account for it being the previous epoch.
                // - One to account for the state advancing an epoch whilst generating the validator
                //     statuses.
                const index = monitoredValidator.index;
                const status = statuses[index];
                if (status === undefined) {
                    continue;
                }
                const summary = statusToSummary(status);
                if (summary.isPrevSourceAttester) {
                    metrics.validatorMonitor.prevEpochOnChainAttesterHit.inc({ index });
                }
                else {
                    metrics.validatorMonitor.prevEpochOnChainAttesterMiss.inc({ index });
                }
                if (summary.isPrevHeadAttester) {
                    metrics.validatorMonitor.prevEpochOnChainHeadAttesterHit.inc({ index });
                }
                else {
                    metrics.validatorMonitor.prevEpochOnChainHeadAttesterMiss.inc({ index });
                }
                if (summary.isPrevTargetAttester) {
                    metrics.validatorMonitor.prevEpochOnChainTargetAttesterHit.inc({ index });
                }
                else {
                    metrics.validatorMonitor.prevEpochOnChainTargetAttesterMiss.inc({ index });
                }
                const prevEpochSummary = monitoredValidator.summaries.get(previousEpoch);
                const attestationCorrectHead = prevEpochSummary === null || prevEpochSummary === void 0 ? void 0 : prevEpochSummary.attestationCorrectHead;
                if (attestationCorrectHead !== null && attestationCorrectHead !== undefined) {
                    metrics.validatorMonitor.prevOnChainAttesterCorrectHead.set({ index }, attestationCorrectHead ? 1 : 0);
                }
                const attestationMinBlockInclusionDistance = prevEpochSummary === null || prevEpochSummary === void 0 ? void 0 : prevEpochSummary.attestationMinBlockInclusionDistance;
                const inclusionDistance = attestationMinBlockInclusionDistance != null && attestationMinBlockInclusionDistance > 0
                    ? // altair, attestation is not missed
                        attestationMinBlockInclusionDistance
                    : summary.inclusionDistance
                        ? // phase0, this is from the state transition
                            summary.inclusionDistance
                        : null;
                if (inclusionDistance !== null) {
                    metrics.validatorMonitor.prevEpochOnChainInclusionDistance.set({ index }, inclusionDistance);
                }
                const balance = balances && balances[index];
                if (balance !== undefined) {
                    metrics.validatorMonitor.prevEpochOnChainBalance.set({ index }, balance);
                }
            }
        },
        registerBeaconBlock(src, seenTimestampSec, block) {
            const index = block.proposerIndex;
            const validator = validators.get(index);
            // Returns the delay between the start of `block.slot` and `seenTimestamp`.
            const delaySec = seenTimestampSec - (genesisTime + block.slot * config.SECONDS_PER_SLOT);
            metrics.gossipBlock.elappsedTimeTillReceived.observe(delaySec);
            if (validator) {
                metrics.validatorMonitor.beaconBlockTotal.inc({ src, index });
                metrics.validatorMonitor.beaconBlockDelaySeconds.observe({ src, index }, delaySec);
            }
        },
        registerUnaggregatedAttestation(src, seenTimestampSec, indexedAttestation) {
            const data = indexedAttestation.data;
            const epoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(data.slot);
            // Returns the duration between when the attestation `data` could be produced (1/3rd through the slot) and `seenTimestamp`.
            const delaySec = seenTimestampSec - (genesisTime + (data.slot + 1 / 3) * config.SECONDS_PER_SLOT);
            for (const index of indexedAttestation.attestingIndices) {
                const validator = validators.get(index);
                if (validator) {
                    metrics.validatorMonitor.unaggregatedAttestationTotal.inc({ src, index });
                    metrics.validatorMonitor.unaggregatedAttestationDelaySeconds.observe({ src, index }, delaySec);
                    withEpochSummary(validator, epoch, (summary) => {
                        var _a;
                        summary.attestations += 1;
                        summary.attestationMinDelay = Math.min(delaySec, (_a = summary.attestationMinDelay) !== null && _a !== void 0 ? _a : Infinity);
                    });
                }
            }
        },
        registerAggregatedAttestation(src, seenTimestampSec, signedAggregateAndProof, indexedAttestation) {
            const data = indexedAttestation.data;
            const epoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(data.slot);
            // Returns the duration between when a `AggregateAndproof` with `data` could be produced (2/3rd through the slot) and `seenTimestamp`.
            const delaySec = seenTimestampSec - (genesisTime + (data.slot + 2 / 3) * config.SECONDS_PER_SLOT);
            const aggregatorIndex = signedAggregateAndProof.message.aggregatorIndex;
            const validtorAggregator = validators.get(aggregatorIndex);
            if (validtorAggregator) {
                const index = aggregatorIndex;
                metrics.validatorMonitor.aggregatedAttestationTotal.inc({ src, index });
                metrics.validatorMonitor.aggregatedAttestationDelaySeconds.observe({ src, index }, delaySec);
                withEpochSummary(validtorAggregator, epoch, (summary) => {
                    var _a;
                    summary.aggregates += 1;
                    summary.aggregateMinDelay = Math.min(delaySec, (_a = summary.aggregateMinDelay) !== null && _a !== void 0 ? _a : Infinity);
                });
            }
            for (const index of indexedAttestation.attestingIndices) {
                const validator = validators.get(index);
                if (validator) {
                    metrics.validatorMonitor.attestationInAggregateTotal.inc({ src, index });
                    metrics.validatorMonitor.attestationInAggregateDelaySeconds.observe({ src, index }, delaySec);
                    withEpochSummary(validator, epoch, (summary) => {
                        summary.attestationAggregateIncusions += 1;
                    });
                }
            }
        },
        // Register that the `indexed_attestation` was included in a *valid* `BeaconBlock`.
        registerAttestationInBlock(indexedAttestation, parentSlot, rootCache) {
            const data = indexedAttestation.data;
            // optimal inclusion distance, not to count skipped slots between data.slot and blockSlot
            const inclusionDistance = Math.max(parentSlot - data.slot, 0) + 1;
            const delay = inclusionDistance - lodestar_params_1.MIN_ATTESTATION_INCLUSION_DELAY;
            const epoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(data.slot);
            let correctHead = null;
            for (const index of indexedAttestation.attestingIndices) {
                const validator = validators.get(index);
                if (validator) {
                    metrics.validatorMonitor.attestationInBlockTotal.inc({ index });
                    metrics.validatorMonitor.attestationInBlockDelaySlots.observe({ index }, delay);
                    withEpochSummary(validator, epoch, (summary) => {
                        summary.attestationBlockInclusions += 1;
                        if (summary.attestationMinBlockInclusionDistance !== null) {
                            summary.attestationMinBlockInclusionDistance = Math.min(summary.attestationMinBlockInclusionDistance, inclusionDistance);
                        }
                        else {
                            summary.attestationMinBlockInclusionDistance = inclusionDistance;
                        }
                        if (correctHead === null) {
                            correctHead = lodestar_types_1.ssz.Root.equals(rootCache.getBlockRootAtSlot(data.slot), data.beaconBlockRoot);
                        }
                        summary.attestationCorrectHead = correctHead;
                    });
                }
            }
        },
        /**
         * Scrape `self` for metrics.
         * Should be called whenever Prometheus is scraping.
         */
        scrapeMetrics(slotClock) {
            metrics.validatorMonitor.validatorsTotal.set(validators.size);
            const epoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slotClock);
            const slotInEpoch = slotClock % lodestar_params_1.SLOTS_PER_EPOCH;
            // Only start to report on the current epoch once we've progressed past the point where
            // all attestation should be included in a block.
            //
            // This allows us to set alarms on Grafana to detect when an attestation has been
            // missed. If we didn't delay beyond the attestation inclusion period then we could
            // expect some occasional false-positives on attestation misses.
            //
            // I have chosen 3 as an arbitrary number where we *probably* shouldn't see that many
            // skip slots on mainnet.
            const previousEpoch = slotInEpoch > lodestar_params_1.MIN_ATTESTATION_INCLUSION_DELAY + 3 ? epoch - 1 : epoch - 2;
            for (const validator of validators.values()) {
                const index = validator.index;
                const summary = validator.summaries.get(previousEpoch);
                if (!summary) {
                    continue;
                }
                // Attestations
                metrics.validatorMonitor.prevEpochAttestationsTotal.set({ index }, summary.attestations);
                if (summary.attestationMinDelay !== null)
                    metrics.validatorMonitor.prevEpochAttestationsMinDelaySeconds.observe({ index }, summary.attestationMinDelay);
                metrics.validatorMonitor.prevEpochAttestationAggregateInclusions.set({ index }, summary.attestationAggregateIncusions);
                metrics.validatorMonitor.prevEpochAttestationBlockInclusions.set({ index }, summary.attestationBlockInclusions);
                if (summary.attestationMinBlockInclusionDistance !== null) {
                    metrics.validatorMonitor.prevEpochAttestationBlockMinInclusionDistance.set({ index }, summary.attestationMinBlockInclusionDistance);
                }
                // Blocks
                metrics.validatorMonitor.prevEpochBeaconBlocksTotal.set({ index }, summary.blocks);
                if (summary.blockMinDelay !== null)
                    metrics.validatorMonitor.prevEpochBeaconBlocksMinDelaySeconds.observe({ index }, summary.blockMinDelay);
                // Aggregates
                metrics.validatorMonitor.prevEpochAggregatesTotal.set({ index }, summary.aggregates);
                if (summary.aggregateMinDelay !== null)
                    metrics.validatorMonitor.prevEpochAggregatesMinDelaySeconds.observe({ index }, summary.aggregateMinDelay);
            }
        },
    };
}
exports.createValidatorMonitor = createValidatorMonitor;
//# sourceMappingURL=validatorMonitor.js.map