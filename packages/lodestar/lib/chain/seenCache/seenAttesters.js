"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeenAggregators = exports.SeenAttesters = void 0;
const map_1 = require("../../util/map");
// The next, current and previous epochs. We require the next epoch due to the
// `MAXIMUM_GOSSIP_CLOCK_DISPARITY`. We require the previous epoch since the
// specification delcares:
//
// ```
// aggregate.data.slot + ATTESTATION_PROPAGATION_SLOT_RANGE
//      >= current_slot >= aggregate.data.slot
// ```
//
// This means that during the current epoch we will always accept an attestation
// from at least one slot in the previous epoch.
const MAX_EPOCHS = 3;
/**
 * Keeps a cache to filter unaggregated attestations from the same validator in the same epoch.
 */
class SeenAttesters {
    constructor() {
        this.validatorIndexesByEpoch = new map_1.MapDef(() => new Set());
        this.lowestPermissibleEpoch = 0;
    }
    isKnown(targetEpoch, validatorIndex) {
        var _a;
        return ((_a = this.validatorIndexesByEpoch.get(targetEpoch)) === null || _a === void 0 ? void 0 : _a.has(validatorIndex)) === true;
    }
    add(targetEpoch, validatorIndex) {
        if (targetEpoch < this.lowestPermissibleEpoch) {
            throw Error(`EpochTooLow ${targetEpoch} < ${this.lowestPermissibleEpoch}`);
        }
        this.validatorIndexesByEpoch.getOrDefault(targetEpoch).add(validatorIndex);
    }
    prune(currentEpoch) {
        this.lowestPermissibleEpoch = Math.max(currentEpoch - MAX_EPOCHS, 0);
        for (const epoch of this.validatorIndexesByEpoch.keys()) {
            if (epoch < this.lowestPermissibleEpoch) {
                this.validatorIndexesByEpoch.delete(epoch);
            }
        }
    }
}
exports.SeenAttesters = SeenAttesters;
/**
 * Keeps a cache to filter aggregated attestations from the same aggregators in the same epoch
 */
class SeenAggregators extends SeenAttesters {
}
exports.SeenAggregators = SeenAggregators;
//# sourceMappingURL=seenAttesters.js.map