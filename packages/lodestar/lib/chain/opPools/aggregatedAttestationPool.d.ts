import { Epoch, ParticipationFlags, Slot, ValidatorIndex } from "@chainsafe/lodestar-types";
import { CachedBeaconStateAllForks, phase0 } from "@chainsafe/lodestar-beacon-state-transition";
import { List } from "@chainsafe/ssz";
import { InsertOutcome } from "./types";
/**
 * Maintain a pool of aggregated attestations. Attestations can be retrieved for inclusion in a block
 * or api. The returned attestations are aggregated to maximise the number of validators that can be
 * included.
 * Note that we want to remove attestations with attesters that were included in the chain.
 */
export declare class AggregatedAttestationPool {
    private readonly attestationGroupByDataHashBySlot;
    private lowestPermissibleSlot;
    add(attestation: phase0.Attestation, attestingIndices: ValidatorIndex[], committee: ValidatorIndex[]): InsertOutcome;
    /** Remove attestations which are too old to be included in a block. */
    prune(clockSlot: Slot): void;
    /**
     * Get attestations to be included in a block. Returns $MAX_ATTESTATIONS items
     */
    getAttestationsForBlock(state: CachedBeaconStateAllForks): phase0.Attestation[];
    /**
     * Get all attestations optionally filtered by `attestation.data.slot`
     * @param bySlot slot to filter, `bySlot === attestation.data.slot`
     */
    getAll(bySlot?: Slot): phase0.Attestation[];
    /**
     * Get attestations to be included in a phase0 block.
     * As we are close to altair, this is not really important, it's mainly for e2e.
     * The performance is not great due to the different BeaconState data structure to altair.
     */
    private getParticipationPhase0;
    /**
     * Get attestations to be included in an altair block.
     * Attestations are sorted by inclusion distance then number of attesters.
     * Attestations should pass the validation when processing attestations in beacon-state-transition.
     */
    private getParticipationAltair;
}
interface AttestationWithIndex {
    attestation: phase0.Attestation;
    attestingIndices: Set<ValidatorIndex>;
    notSeenAttesterCount?: number;
}
/**
 * Maintain a pool of AggregatedAttestation which all share the same AttestationData.
 * Preaggregate into smallest number of attestations.
 * When getting attestations to be included in a block, sort by number of attesters.
 * Use committee instead of aggregationBits to improve performance.
 */
export declare class MatchingDataAttestationGroup {
    readonly committee: ValidatorIndex[];
    readonly data: phase0.AttestationData;
    private readonly attestations;
    constructor(committee: ValidatorIndex[], data: phase0.AttestationData);
    /**
     * Add an attestation.
     * Try to preaggregate to existing attestations if possible.
     * If it's a subset of an existing attestations, it's not neccesrary to add to our pool.
     * If it's a superset of an existing attestation, remove the existing attestation and add new.
     */
    add(attestation: AttestationWithIndex): InsertOutcome;
    getAttestationsForBlock(seenAttestingIndices: Set<ValidatorIndex>): AttestationWithIndex[];
    /** Get attestations for API. */
    getAttestations(): phase0.Attestation[];
}
export declare function aggregateInto(attestation1: AttestationWithIndex, attestation2: AttestationWithIndex): void;
export declare function extractParticipation(attestations: List<phase0.PendingAttestation>, state: CachedBeaconStateAllForks): Set<ValidatorIndex>;
export declare function intersection(bigSet: Set<ValidatorIndex>, smallSet: Set<ValidatorIndex>): number;
/**
 * The state transition accepts incorrect target and head attestations.
 * We only need to validate the source checkpoint.
 * @returns
 */
export declare function isValidAttestationData(currentEpoch: Epoch, previousJustifiedCheckpoint: phase0.Checkpoint, currentJustifiedCheckpoint: phase0.Checkpoint, data: phase0.AttestationData): boolean;
/**
 * Returns true if the `TIMELY_SOURCE` bit in a `ParticipationFlags` is set
 */
export declare function flagIsTimelySource(flag: ParticipationFlags): boolean;
export {};
//# sourceMappingURL=aggregatedAttestationPool.d.ts.map