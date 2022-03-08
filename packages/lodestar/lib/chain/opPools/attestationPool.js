"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttestationPool = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const bls_1 = __importStar(require("@chainsafe/bls"));
const ssz_1 = require("@chainsafe/ssz");
const types_1 = require("./types");
const utils_1 = require("./utils");
const map_1 = require("../../util/map");
/**
 * The number of slots that will be stored in the pool.
 *
 * For example, if `SLOTS_RETAINED == 3` and the pool is pruned at slot `6`, then all attestations
 * at slots less than `4` will be dropped and any future attestation with a slot less than `4`
 * will be refused.
 */
const SLOTS_RETAINED = 3;
/**
 * The maximum number of distinct `AttestationData` that will be stored in each slot.
 *
 * This is a DoS protection measure.
 */
const MAX_ATTESTATIONS_PER_SLOT = 16384;
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
class AttestationPool {
    constructor() {
        this.attestationByRootBySlot = new map_1.MapDef(() => new Map());
        this.lowestPermissibleSlot = 0;
    }
    // TODO: Add metrics for total num of attestations in the pool
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
    add(attestation) {
        const slot = attestation.data.slot;
        const lowestPermissibleSlot = this.lowestPermissibleSlot;
        // Reject any attestations that are too old.
        if (slot < lowestPermissibleSlot) {
            return types_1.InsertOutcome.Old;
        }
        // Limit object per slot
        const aggregateByRoot = this.attestationByRootBySlot.getOrDefault(slot);
        if (aggregateByRoot.size >= MAX_ATTESTATIONS_PER_SLOT) {
            throw new types_1.OpPoolError({ code: types_1.OpPoolErrorCode.REACHED_MAX_PER_SLOT });
        }
        const dataRoot = lodestar_types_1.ssz.phase0.AttestationData.hashTreeRoot(attestation.data);
        const dataRootHex = (0, ssz_1.toHexString)(dataRoot);
        // Pre-aggregate the contribution with existing items
        const aggregate = aggregateByRoot.get(dataRootHex);
        if (aggregate) {
            // Aggregate mutating
            return aggregateAttestationInto(aggregate, attestation);
        }
        else {
            // Create new aggregate
            aggregateByRoot.set(dataRootHex, attestationToAggregate(attestation));
            return types_1.InsertOutcome.NewData;
        }
    }
    /**
     * For validator API to get an aggregate
     */
    getAggregate(slot, dataRoot) {
        var _a;
        const dataRootHex = (0, ssz_1.toHexString)(dataRoot);
        const aggregate = (_a = this.attestationByRootBySlot.get(slot)) === null || _a === void 0 ? void 0 : _a.get(dataRootHex);
        if (!aggregate) {
            // TODO: Add metric for missing aggregates
            throw Error(`No attestation for slot=${slot} dataRoot=${dataRootHex}`);
        }
        return fastToAttestation(aggregate);
    }
    /**
     * Removes any attestations with a slot lower than `current_slot` and bars any future
     * attestations with a slot lower than `current_slot - SLOTS_RETAINED`.
     */
    prune(clockSlot) {
        (0, utils_1.pruneBySlot)(this.attestationByRootBySlot, clockSlot, SLOTS_RETAINED);
        this.lowestPermissibleSlot = Math.max(clockSlot - SLOTS_RETAINED, 0);
    }
    /**
     * Get all attestations optionally filtered by `attestation.data.slot`
     * @param bySlot slot to filter, `bySlot === attestation.data.slot`
     */
    getAll(bySlot) {
        const attestations = [];
        const aggregateByRoots = bySlot === undefined
            ? Array.from(this.attestationByRootBySlot.values())
            : [this.attestationByRootBySlot.get(bySlot)];
        for (const aggregateByRoot of aggregateByRoots) {
            if (aggregateByRoot) {
                for (const aggFast of aggregateByRoot.values()) {
                    attestations.push(fastToAttestation(aggFast));
                }
            }
        }
        return attestations;
    }
}
exports.AttestationPool = AttestationPool;
// - Retrieve agg attestations by slot and data root
// - Insert attestations coming from gossip and API
/**
 * Aggregate a new contribution into `aggregate` mutating it
 */
function aggregateAttestationInto(aggregate, attestation) {
    const bitIndex = bitArrayGetSingleTrueBit(attestation.aggregationBits);
    // Should never happen, attestations are verified against this exact condition before
    if (bitIndex === null) {
        throw Error("Invalid attestation not exactly one bit set");
    }
    if (aggregate.aggregationBits[bitIndex] === true) {
        return types_1.InsertOutcome.AlreadyKnown;
    }
    aggregate.aggregationBits[bitIndex] = true;
    aggregate.signature = bls_1.Signature.aggregate([
        aggregate.signature,
        bls_1.default.Signature.fromBytes(attestation.signature.valueOf(), undefined, true),
    ]);
    return types_1.InsertOutcome.Aggregated;
}
/**
 * Format `contribution` into an efficient `aggregate` to add more contributions in with aggregateContributionInto()
 */
function attestationToAggregate(attestation) {
    return {
        data: attestation.data,
        aggregationBits: Array.from((0, ssz_1.readonlyValues)(attestation.aggregationBits)),
        signature: bls_1.default.Signature.fromBytes(attestation.signature.valueOf(), undefined, true),
    };
}
/**
 * Unwrap AggregateFast to phase0.Attestation
 */
function fastToAttestation(aggFast) {
    return {
        data: aggFast.data,
        aggregationBits: aggFast.aggregationBits,
        signature: aggFast.signature.toBytes(bls_1.PointFormat.compressed),
    };
}
function bitArrayGetSingleTrueBit(bits) {
    for (const [index, participated] of Array.from((0, ssz_1.readonlyValues)(bits)).entries()) {
        if (participated) {
            return index;
        }
    }
    return null;
}
//# sourceMappingURL=attestationPool.js.map