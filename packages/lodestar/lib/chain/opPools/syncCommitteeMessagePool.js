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
exports.SyncCommitteeMessagePool = void 0;
const bls_1 = __importStar(require("@chainsafe/bls"));
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const ssz_1 = require("@chainsafe/ssz");
const map_1 = require("../../util/map");
const types_1 = require("./types");
const utils_1 = require("./utils");
/**
 * SyncCommittee signatures are only useful during a single slot according to our peer's clocks
 */
const SLOTS_RETAINED = 3;
/**
 * The maximum number of distinct `ContributionFast` that will be stored in each slot.
 *
 * This is a DoS protection measure.
 */
const MAX_ITEMS_PER_SLOT = 512;
/**
 * Preaggregate SyncCommitteeMessage into SyncCommitteeContribution
 * and cache seen SyncCommitteeMessage by slot + validator index.
 * This stays in-memory and should be pruned per slot.
 */
class SyncCommitteeMessagePool {
    constructor() {
        /**
         * Each array item is respective to a subcommitteeIndex.
         * Preaggregate into SyncCommitteeContribution.
         * */
        this.contributionsByRootBySubnetBySlot = new map_1.MapDef(() => new map_1.MapDef(() => new Map()));
        this.lowestPermissibleSlot = 0;
    }
    // TODO: indexInSubcommittee: number should be indicesInSyncCommittee
    add(subnet, signature, indexInSubcommittee) {
        const { slot, beaconBlockRoot } = signature;
        const rootHex = (0, ssz_1.toHexString)(beaconBlockRoot);
        const lowestPermissibleSlot = this.lowestPermissibleSlot;
        // Reject if too old.
        if (slot < lowestPermissibleSlot) {
            throw new types_1.OpPoolError({ code: types_1.OpPoolErrorCode.SLOT_TOO_LOW, slot, lowestPermissibleSlot });
        }
        // Limit object per slot
        const contributionsByRoot = this.contributionsByRootBySubnetBySlot.getOrDefault(slot).getOrDefault(subnet);
        if (contributionsByRoot.size >= MAX_ITEMS_PER_SLOT) {
            throw new types_1.OpPoolError({ code: types_1.OpPoolErrorCode.REACHED_MAX_PER_SLOT });
        }
        // Pre-aggregate the contribution with existing items
        const contribution = contributionsByRoot.get(rootHex);
        if (contribution) {
            // Aggregate mutating
            return aggregateSignatureInto(contribution, signature, indexInSubcommittee);
        }
        else {
            // Create new aggregate
            contributionsByRoot.set(rootHex, signatureToAggregate(subnet, signature, indexInSubcommittee));
            return types_1.InsertOutcome.NewData;
        }
    }
    /**
     * This is for the aggregator to produce ContributionAndProof.
     */
    getContribution(subnet, slot, prevBlockRoot) {
        var _a, _b;
        const contribution = (_b = (_a = this.contributionsByRootBySubnetBySlot.get(slot)) === null || _a === void 0 ? void 0 : _a.get(subnet)) === null || _b === void 0 ? void 0 : _b.get((0, ssz_1.toHexString)(prevBlockRoot));
        if (!contribution) {
            return null;
        }
        return {
            ...contribution,
            aggregationBits: contribution.aggregationBits,
            signature: contribution.signature.toBytes(bls_1.PointFormat.compressed),
        };
    }
    /**
     * Prune per clock slot.
     * SyncCommittee signatures are only useful during a single slot according to our peer's clocks
     */
    prune(clockSlot) {
        (0, utils_1.pruneBySlot)(this.contributionsByRootBySubnetBySlot, clockSlot, SLOTS_RETAINED);
        this.lowestPermissibleSlot = Math.max(clockSlot - SLOTS_RETAINED, 0);
    }
}
exports.SyncCommitteeMessagePool = SyncCommitteeMessagePool;
/**
 * Aggregate a new signature into `contribution` mutating it
 */
function aggregateSignatureInto(contribution, signature, indexInSubcommittee) {
    if (contribution.aggregationBits[indexInSubcommittee] === true) {
        return types_1.InsertOutcome.AlreadyKnown;
    }
    contribution.aggregationBits[indexInSubcommittee] = true;
    contribution.signature = bls_1.Signature.aggregate([
        contribution.signature,
        bls_1.default.Signature.fromBytes(signature.signature.valueOf(), undefined, true),
    ]);
    return types_1.InsertOutcome.Aggregated;
}
/**
 * Format `signature` into an efficient `contribution` to add more signatures in with aggregateSignatureInto()
 */
function signatureToAggregate(subnet, signature, indexInSubcommittee) {
    const indexesPerSubnet = Math.floor(lodestar_params_1.SYNC_COMMITTEE_SIZE / lodestar_params_1.SYNC_COMMITTEE_SUBNET_COUNT);
    const aggregationBits = (0, lodestar_beacon_state_transition_1.newFilledArray)(indexesPerSubnet, false);
    aggregationBits[indexInSubcommittee] = true;
    return {
        slot: signature.slot,
        beaconBlockRoot: signature.beaconBlockRoot,
        subcommitteeIndex: subnet,
        aggregationBits,
        signature: bls_1.default.Signature.fromBytes(signature.signature.valueOf(), undefined, true),
    };
}
//# sourceMappingURL=syncCommitteeMessagePool.js.map