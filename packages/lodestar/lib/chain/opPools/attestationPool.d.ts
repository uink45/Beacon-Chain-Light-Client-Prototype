import { phase0, Slot, Root } from "@chainsafe/lodestar-types";
import { InsertOutcome } from "./types";
/**
 * A pool of `Attestation` that is specially designed to store "unaggregated" attestations from
 * the native aggregation scheme.
 *
 * **The `NaiveAggregationPool` does not do any signature or attestation verification. It assumes
 * that all `Attestation` objects provided are valid.**
 *
 * ## Details
 *
 * The pool sorts the `Attestation` by `attestation.data.slot`, then by `attestation.data`.
 *
 * As each unaggregated attestation is added it is aggregated with any existing `attestation` with
 * the same `AttestationData`. Considering that the pool only accepts attestations with a single
 * signature, there should only ever be a single aggregated `Attestation` for any given
 * `AttestationData`.
 *
 * The pool has a capacity for `SLOTS_RETAINED` slots, when a new `attestation.data.slot` is
 * provided, the oldest slot is dropped and replaced with the new slot. The pool can also be
 * pruned by supplying a `current_slot`; all existing attestations with a slot lower than
 * `current_slot - SLOTS_RETAINED` will be removed and any future attestation with a slot lower
 * than that will also be refused. Pruning is done automatically based upon the attestations it
 * receives and it can be triggered manually.
 */
export declare class AttestationPool {
    private readonly attestationByRootBySlot;
    private lowestPermissibleSlot;
    /**
     * Accepts an `VerifiedUnaggregatedAttestation` and attempts to apply it to the "naive
     * aggregation pool".
     *
     * The naive aggregation pool is used by local validators to produce
     * `SignedAggregateAndProof`.
     *
     * If the attestation is too old (low slot) to be included in the pool it is simply dropped
     * and no error is returned.
     *
     * Expects the attestation to be fully validated:
     * - Valid signature
     * - Consistent bitlength
     * - Valid committeeIndex
     * - Valid data
     */
    add(attestation: phase0.Attestation): InsertOutcome;
    /**
     * For validator API to get an aggregate
     */
    getAggregate(slot: Slot, dataRoot: Root): phase0.Attestation;
    /**
     * Removes any attestations with a slot lower than `current_slot` and bars any future
     * attestations with a slot lower than `current_slot - SLOTS_RETAINED`.
     */
    prune(clockSlot: Slot): void;
    /**
     * Get all attestations optionally filtered by `attestation.data.slot`
     * @param bySlot slot to filter, `bySlot === attestation.data.slot`
     */
    getAll(bySlot?: Slot): phase0.Attestation[];
}
//# sourceMappingURL=attestationPool.d.ts.map