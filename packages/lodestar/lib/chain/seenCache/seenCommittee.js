"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeenSyncCommitteeMessages = void 0;
const map_1 = require("../../util/map");
/**
 * SyncCommittee signatures are only useful during a single slot according to our peer's clocks
 */
const MAX_SLOTS_IN_CACHE = 3;
/**
 * Cache seen SyncCommitteeMessage by slot + validator index.
 */
class SeenSyncCommitteeMessages {
    constructor() {
        this.seenCacheBySlot = new map_1.MapDef(() => new Set());
    }
    /**
     * based on slot + validator index
     */
    isKnown(slot, subnet, validatorIndex) {
        var _a;
        return ((_a = this.seenCacheBySlot.get(slot)) === null || _a === void 0 ? void 0 : _a.has(seenCacheKey(subnet, validatorIndex))) === true;
    }
    /** Register item as seen in the cache */
    add(slot, subnet, validatorIndex) {
        this.seenCacheBySlot.getOrDefault(slot).add(seenCacheKey(subnet, validatorIndex));
    }
    /** Prune per clock slot */
    prune(clockSlot) {
        for (const slot of this.seenCacheBySlot.keys()) {
            if (slot < clockSlot - MAX_SLOTS_IN_CACHE) {
                this.seenCacheBySlot.delete(slot);
            }
        }
    }
}
exports.SeenSyncCommitteeMessages = SeenSyncCommitteeMessages;
function seenCacheKey(subnet, validatorIndex) {
    return `${subnet}-${validatorIndex}`;
}
//# sourceMappingURL=seenCommittee.js.map