"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBetterUpdate = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
/**
 * Returns the update with more bits. On ties, newUpdate is the better
 *
 * Spec v1.0.1
 * ```python
 * max(store.valid_updates, key=lambda update: sum(update.sync_committee_bits)))
 * ```
 */
function isBetterUpdate(prev, next) {
    // Finalized if participation is over 66%
    if (!prev.isFinalized && next.isFinalized && next.participation * 3 > lodestar_params_1.SYNC_COMMITTEE_SIZE * 2) {
        return true;
    }
    // Higher bit count
    if (prev.participation > next.participation)
        return false;
    if (prev.participation < next.participation)
        return true;
    // else keep the oldest, lowest chance or re-org and requires less updating
    return prev.slot > next.slot;
}
exports.isBetterUpdate = isBetterUpdate;
//# sourceMappingURL=update.js.map