"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flagIsTimelySource = exports.isValidAttestationData = exports.intersection = exports.extractParticipation = exports.aggregateInto = exports.MatchingDataAttestationGroup = exports.AggregatedAttestationPool = void 0;
const bls_1 = __importDefault(require("@chainsafe/bls"));
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const ssz_1 = require("@chainsafe/ssz");
const map_1 = require("../../util/map");
const utils_1 = require("./utils");
const types_1 = require("./types");
/**
 * Limit the max attestations with the same AttestationData.
 * Processing cost increases with each new attestation. This number is not backed by data.
 * After merging AggregatedAttestationPool, gather numbers from a real network and investigate
 * how does participation looks like in attestations.
 */
const MAX_RETAINED_ATTESTATIONS_PER_GROUP = 4;
/**
 * On mainnet, each slot has 64 committees, and each block has 128 attestations max so we don't
 * want to store more than 2 per group.
 */
const MAX_ATTESTATIONS_PER_GROUP = 2;
/** Same to https://github.com/ethereum/eth2.0-specs/blob/v1.1.0-alpha.5/specs/altair/beacon-chain.md#has_flag */
const TIMELY_SOURCE = 1 << lodestar_params_1.TIMELY_SOURCE_FLAG_INDEX;
/**
 * Maintain a pool of aggregated attestations. Attestations can be retrieved for inclusion in a block
 * or api. The returned attestations are aggregated to maximise the number of validators that can be
 * included.
 * Note that we want to remove attestations with attesters that were included in the chain.
 */
class AggregatedAttestationPool {
    constructor() {
        this.attestationGroupByDataHashBySlot = new map_1.MapDef(() => new Map());
        this.lowestPermissibleSlot = 0;
    }
    add(attestation, attestingIndices, committee) {
        const slot = attestation.data.slot;
        const lowestPermissibleSlot = this.lowestPermissibleSlot;
        // Reject any attestations that are too old.
        if (slot < lowestPermissibleSlot) {
            return types_1.InsertOutcome.Old;
        }
        const attestationGroupByDataHash = this.attestationGroupByDataHashBySlot.getOrDefault(slot);
        const dataRoot = lodestar_types_1.ssz.phase0.AttestationData.hashTreeRoot(attestation.data);
        const dataRootHex = (0, ssz_1.toHexString)(dataRoot);
        let attestationGroup = attestationGroupByDataHash.get(dataRootHex);
        if (!attestationGroup) {
            attestationGroup = new MatchingDataAttestationGroup(committee, attestation.data);
            attestationGroupByDataHash.set(dataRootHex, attestationGroup);
        }
        return attestationGroup.add({ attestation, attestingIndices: new Set(attestingIndices) });
    }
    /** Remove attestations which are too old to be included in a block. */
    prune(clockSlot) {
        // Only retain SLOTS_PER_EPOCH slots
        (0, utils_1.pruneBySlot)(this.attestationGroupByDataHashBySlot, clockSlot, lodestar_params_1.SLOTS_PER_EPOCH);
        this.lowestPermissibleSlot = Math.max(clockSlot - lodestar_params_1.SLOTS_PER_EPOCH, 0);
    }
    /**
     * Get attestations to be included in a block. Returns $MAX_ATTESTATIONS items
     */
    getAttestationsForBlock(state) {
        const stateSlot = state.slot;
        const stateEpoch = state.currentShuffling.epoch;
        const statePrevEpoch = stateEpoch - 1;
        const forkName = state.config.getForkName(stateSlot);
        const getParticipationFn = forkName === lodestar_params_1.ForkName.phase0 ? this.getParticipationPhase0(state) : this.getParticipationAltair(state);
        const attestationsByScore = [];
        const slots = Array.from(this.attestationGroupByDataHashBySlot.keys()).sort((a, b) => b - a);
        const { previousJustifiedCheckpoint, currentJustifiedCheckpoint } = state;
        slot: for (const slot of slots) {
            const attestationGroupByDataHash = this.attestationGroupByDataHashBySlot.get(slot);
            // should not happen
            if (!attestationGroupByDataHash) {
                throw Error(`No aggregated attestation pool for slot=${slot}`);
            }
            const epoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot);
            // validateAttestation condition: Attestation target epoch not in previous or current epoch
            if (!(epoch === stateEpoch || epoch === statePrevEpoch)) {
                continue; // Invalid attestations
            }
            // validateAttestation condition: Attestation slot not within inclusion window
            if (!(slot + lodestar_params_1.MIN_ATTESTATION_INCLUSION_DELAY <= stateSlot && stateSlot <= slot + lodestar_params_1.SLOTS_PER_EPOCH)) {
                continue; // Invalid attestations
            }
            const attestationGroups = Array.from(attestationGroupByDataHash.values());
            for (const attestationGroup of attestationGroups) {
                if (!isValidAttestationData(stateEpoch, previousJustifiedCheckpoint, currentJustifiedCheckpoint, attestationGroup.data)) {
                    continue;
                }
                const participation = getParticipationFn(epoch, attestationGroup.committee);
                if (participation === null) {
                    continue;
                }
                // TODO: Is it necessary to validateAttestation for:
                // - Attestation committee index not within current committee count
                // - Attestation aggregation bits length does not match committee length
                //
                // These properties should not change after being validate in gossip
                // IF they have to be validated, do it only with one attestation per group since same data
                // The committeeCountPerSlot can be precomputed once per slot
                attestationsByScore.push(...attestationGroup.getAttestationsForBlock(participation).map((attestation) => {
                    var _a;
                    return ({
                        attestation: attestation.attestation,
                        score: ((_a = attestation.notSeenAttesterCount) !== null && _a !== void 0 ? _a : attestation.attestingIndices.size) / (stateSlot - slot),
                    });
                }));
                // Stop accumulating attestations there are enough that may have good scoring
                if (attestationsByScore.length > lodestar_params_1.MAX_ATTESTATIONS * 2) {
                    break slot;
                }
            }
        }
        return attestationsByScore
            .sort((a, b) => b.score - a.score)
            .slice(0, lodestar_params_1.MAX_ATTESTATIONS)
            .map((attestation) => attestation.attestation);
    }
    /**
     * Get all attestations optionally filtered by `attestation.data.slot`
     * @param bySlot slot to filter, `bySlot === attestation.data.slot`
     */
    getAll(bySlot) {
        let attestationGroupsArr;
        if (bySlot === undefined) {
            attestationGroupsArr = Array.from(this.attestationGroupByDataHashBySlot.values());
        }
        else {
            const attestationGroups = this.attestationGroupByDataHashBySlot.get(bySlot);
            if (!attestationGroups)
                throw Error(`No attestations for slot ${bySlot}`);
            attestationGroupsArr = [attestationGroups];
        }
        const attestations = [];
        for (const attestationGroups of attestationGroupsArr) {
            for (const attestationGroup of attestationGroups.values()) {
                attestations.push(...attestationGroup.getAttestations());
            }
        }
        return attestations;
    }
    /**
     * Get attestations to be included in a phase0 block.
     * As we are close to altair, this is not really important, it's mainly for e2e.
     * The performance is not great due to the different BeaconState data structure to altair.
     */
    getParticipationPhase0(state) {
        // check for phase0 block already
        const phase0State = state;
        const stateEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(state.slot);
        const previousEpochParticipants = extractParticipation(phase0State.previousEpochAttestations, state);
        const currentEpochParticipants = extractParticipation(phase0State.currentEpochAttestations, state);
        return (epoch) => {
            return epoch === stateEpoch
                ? currentEpochParticipants
                : epoch === stateEpoch - 1
                    ? previousEpochParticipants
                    : null;
        };
    }
    /**
     * Get attestations to be included in an altair block.
     * Attestations are sorted by inclusion distance then number of attesters.
     * Attestations should pass the validation when processing attestations in beacon-state-transition.
     */
    getParticipationAltair(state) {
        // check for altair block already
        const altairState = state;
        const stateEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(state.slot);
        const previousParticipation = altairState.previousEpochParticipation.persistent.toArray();
        const currentParticipation = altairState.currentEpochParticipation.persistent.toArray();
        return (epoch, committee) => {
            const participationStatus = epoch === stateEpoch ? currentParticipation : epoch === stateEpoch - 1 ? previousParticipation : null;
            if (participationStatus === null)
                return null;
            const seenValidatorIndices = new Set();
            for (const validatorIndex of committee) {
                if (flagIsTimelySource(participationStatus[validatorIndex])) {
                    seenValidatorIndices.add(validatorIndex);
                }
            }
            return seenValidatorIndices;
        };
    }
}
exports.AggregatedAttestationPool = AggregatedAttestationPool;
/**
 * Maintain a pool of AggregatedAttestation which all share the same AttestationData.
 * Preaggregate into smallest number of attestations.
 * When getting attestations to be included in a block, sort by number of attesters.
 * Use committee instead of aggregationBits to improve performance.
 */
class MatchingDataAttestationGroup {
    constructor(committee, data) {
        this.committee = committee;
        this.data = data;
        this.attestations = [];
    }
    /**
     * Add an attestation.
     * Try to preaggregate to existing attestations if possible.
     * If it's a subset of an existing attestations, it's not neccesrary to add to our pool.
     * If it's a superset of an existing attestation, remove the existing attestation and add new.
     */
    add(attestation) {
        const { attestingIndices } = attestation;
        // preaggregate
        let insertResult = types_1.InsertOutcome.NewData;
        const indicesToRemove = [];
        for (const [i, existingAttestation] of this.attestations.entries()) {
            const existingAttestingIndices = existingAttestation.attestingIndices;
            const numIntersection = existingAttestingIndices.size >= attestingIndices.size
                ? intersection(existingAttestingIndices, attestingIndices)
                : intersection(attestingIndices, existingAttestingIndices);
            // no intersection
            if (numIntersection === 0) {
                aggregateInto(existingAttestation, attestation);
                insertResult = types_1.InsertOutcome.Aggregated;
            }
            else if (numIntersection === attestingIndices.size) {
                // this new attestation is actually a subset of an existing one, don't want to add it
                insertResult = types_1.InsertOutcome.AlreadyKnown;
            }
            else if (numIntersection === existingAttestingIndices.size) {
                // this new attestation is superset of an existing one, remove existing one
                indicesToRemove.push(i);
            }
        }
        if (insertResult === types_1.InsertOutcome.NewData) {
            for (const index of indicesToRemove.reverse()) {
                this.attestations.splice(index, 1);
            }
            this.attestations.push(attestation);
            // Remove the attestations with less participation
            if (this.attestations.length > MAX_RETAINED_ATTESTATIONS_PER_GROUP) {
                this.attestations.sort((a, b) => b.attestingIndices.size - a.attestingIndices.size);
                this.attestations.splice(MAX_RETAINED_ATTESTATIONS_PER_GROUP, this.attestations.length - MAX_RETAINED_ATTESTATIONS_PER_GROUP);
            }
        }
        return insertResult;
    }
    getAttestationsForBlock(seenAttestingIndices) {
        const attestations = [];
        for (const attestation of this.attestations) {
            let notSeenAttesterCount = 0;
            for (const attIndex of attestation.attestingIndices) {
                if (!seenAttestingIndices.has(attIndex))
                    notSeenAttesterCount++;
            }
            if (notSeenAttesterCount > 0) {
                attestations.push({ ...attestation, notSeenAttesterCount });
            }
        }
        return attestations
            .sort((a, b) => { var _a, _b; return ((_a = b.notSeenAttesterCount) !== null && _a !== void 0 ? _a : b.attestingIndices.size) - ((_b = a.notSeenAttesterCount) !== null && _b !== void 0 ? _b : a.attestingIndices.size); })
            .slice(0, MAX_ATTESTATIONS_PER_GROUP);
    }
    /** Get attestations for API. */
    getAttestations() {
        return this.attestations.map((attestation) => attestation.attestation);
    }
}
exports.MatchingDataAttestationGroup = MatchingDataAttestationGroup;
function aggregateInto(attestation1, attestation2) {
    for (const attIndex of attestation2.attestingIndices) {
        attestation1.attestingIndices.add(attIndex);
    }
    // Merge bits of attestation2 into attestation1
    bitArrayMergeOrWith(attestation1.attestation.aggregationBits, attestation2.attestation.aggregationBits);
    const signature1 = bls_1.default.Signature.fromBytes(attestation1.attestation.signature.valueOf(), undefined, true);
    const signature2 = bls_1.default.Signature.fromBytes(attestation2.attestation.signature.valueOf(), undefined, true);
    attestation1.attestation.signature = bls_1.default.Signature.aggregate([signature1, signature2]).toBytes();
}
exports.aggregateInto = aggregateInto;
function extractParticipation(attestations, state) {
    const { epochCtx } = state;
    const allParticipants = new Set();
    for (const att of (0, ssz_1.readonlyValues)(attestations)) {
        const aggregationBits = att.aggregationBits;
        const attData = att.data;
        const attSlot = attData.slot;
        const committeeIndex = attData.index;
        const committee = epochCtx.getBeaconCommittee(attSlot, committeeIndex);
        const participants = (0, lodestar_beacon_state_transition_1.zipIndexesCommitteeBits)(committee, aggregationBits);
        for (const participant of participants) {
            allParticipants.add(participant);
        }
    }
    return allParticipants;
}
exports.extractParticipation = extractParticipation;
function intersection(bigSet, smallSet) {
    let numIntersection = 0;
    for (const validatorIndex of smallSet) {
        if (bigSet.has(validatorIndex))
            numIntersection++;
    }
    return numIntersection;
}
exports.intersection = intersection;
/**
 * The state transition accepts incorrect target and head attestations.
 * We only need to validate the source checkpoint.
 * @returns
 */
function isValidAttestationData(currentEpoch, previousJustifiedCheckpoint, currentJustifiedCheckpoint, data) {
    let justifiedCheckpoint;
    if (data.target.epoch === currentEpoch) {
        justifiedCheckpoint = currentJustifiedCheckpoint;
    }
    else {
        justifiedCheckpoint = previousJustifiedCheckpoint;
    }
    return lodestar_types_1.ssz.phase0.Checkpoint.equals(data.source, justifiedCheckpoint);
}
exports.isValidAttestationData = isValidAttestationData;
/**
 * Returns true if the `TIMELY_SOURCE` bit in a `ParticipationFlags` is set
 */
function flagIsTimelySource(flag) {
    return (flag & TIMELY_SOURCE) === TIMELY_SOURCE;
}
exports.flagIsTimelySource = flagIsTimelySource;
function bitArrayMergeOrWith(bits1, bits2) {
    for (let i = 0; i < bits2.length; i++) {
        if (bits2[i]) {
            bits1[i] = true;
        }
    }
}
//# sourceMappingURL=aggregatedAttestationPool.js.map