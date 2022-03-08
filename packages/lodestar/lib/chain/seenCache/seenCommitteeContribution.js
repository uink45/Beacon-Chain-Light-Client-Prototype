"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeenContributionAndProof = void 0;
const map_1 = require("../../util/map");
/**
 * SyncCommittee aggregates are only useful for the next block they have signed.
 */
const MAX_SLOTS_IN_CACHE = 8;
/**
 * Cache SyncCommitteeContribution and seen ContributionAndProof.
 * This is used for SignedContributionAndProof validation and block factory.
 * This stays in-memory and should be pruned per slot.
 */
class SeenContributionAndProof {
    constructor() {
        this.seenCacheBySlot = new map_1.MapDef(() => new Set());
    }
    /**
     * Gossip validation requires to check:
     * The sync committee contribution is the first valid contribution received for the aggregator with index
     * contribution_and_proof.aggregator_index for the slot contribution.slot and subcommittee index contribution.subcommittee_index.
     */
    isKnown(slot, subcommitteeIndex, aggregatorIndex) {
        var _a;
        return ((_a = this.seenCacheBySlot.get(slot)) === null || _a === void 0 ? void 0 : _a.has(seenCacheKey(subcommitteeIndex, aggregatorIndex))) === true;
    }
    /** Register item as seen in the cache */
    add(slot, subcommitteeIndex, aggregatorIndex) {
        this.seenCacheBySlot.getOrDefault(slot).add(seenCacheKey(subcommitteeIndex, aggregatorIndex));
    }
    /** Prune per head slot */
    prune(headSlot) {
        for (const slot of this.seenCacheBySlot.keys()) {
            if (slot < headSlot - MAX_SLOTS_IN_CACHE) {
                this.seenCacheBySlot.delete(slot);
            }
        }
    }
}
exports.SeenContributionAndProof = SeenContributionAndProof;
function seenCacheKey(subcommitteeIndex, aggregatorIndex) {
    return `${subcommitteeIndex}-${aggregatorIndex}`;
}
//# sourceMappingURL=seenCommitteeContribution.js.map