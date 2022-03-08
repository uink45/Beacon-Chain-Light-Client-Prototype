"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeenBlockProposers = void 0;
const map_1 = require("../../util/map");
/**
 * Keeps a cache to filter block proposals from the same validator in the same slot.
 *
 * This cache is not bounded and for extremely long periods of non-finality it can grow a lot. However it's practically
 * limited by the possible shufflings in those epochs, and the stored data is very cheap
 */
class SeenBlockProposers {
    constructor() {
        this.proposerIndexesBySlot = new map_1.MapDef(() => new Set());
        this.finalizedSlot = 0;
    }
    isKnown(blockSlot, proposerIndex) {
        var _a;
        return ((_a = this.proposerIndexesBySlot.get(blockSlot)) === null || _a === void 0 ? void 0 : _a.has(proposerIndex)) === true;
    }
    add(blockSlot, proposerIndex) {
        if (blockSlot < this.finalizedSlot) {
            throw Error(`blockSlot ${blockSlot} < finalizedSlot ${this.finalizedSlot}`);
        }
        this.proposerIndexesBySlot.getOrDefault(blockSlot).add(proposerIndex);
    }
    prune(finalizedSlot) {
        this.finalizedSlot = finalizedSlot;
        for (const slot of this.proposerIndexesBySlot.keys()) {
            if (slot < finalizedSlot) {
                this.proposerIndexesBySlot.delete(slot);
            }
        }
    }
}
exports.SeenBlockProposers = SeenBlockProposers;
//# sourceMappingURL=seenBlockProposers.js.map