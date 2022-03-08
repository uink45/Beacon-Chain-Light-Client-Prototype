"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeUntilNextEpoch = exports.computeSyncPeriodAtEpoch = exports.computeSyncPeriodAtSlot = exports.computeEpochAtSlot = exports.slotWithFutureTolerance = exports.getCurrentSlot = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
function getCurrentSlot(config, genesisTime) {
    const diffInSeconds = Date.now() / 1000 - genesisTime;
    return Math.floor(diffInSeconds / config.SECONDS_PER_SLOT);
}
exports.getCurrentSlot = getCurrentSlot;
/** Returns the slot if the internal clock were advanced by `toleranceSec`. */
function slotWithFutureTolerance(config, genesisTime, toleranceSec) {
    // this is the same to getting slot at now + toleranceSec
    return getCurrentSlot(config, genesisTime - toleranceSec);
}
exports.slotWithFutureTolerance = slotWithFutureTolerance;
/**
 * Return the epoch number at the given slot.
 */
function computeEpochAtSlot(slot) {
    return Math.floor(slot / lodestar_params_1.SLOTS_PER_EPOCH);
}
exports.computeEpochAtSlot = computeEpochAtSlot;
/**
 * Return the sync committee period at slot
 */
function computeSyncPeriodAtSlot(slot) {
    return computeSyncPeriodAtEpoch(computeEpochAtSlot(slot));
}
exports.computeSyncPeriodAtSlot = computeSyncPeriodAtSlot;
/**
 * Return the sync committee period at epoch
 */
function computeSyncPeriodAtEpoch(epoch) {
    return Math.floor(epoch / lodestar_params_1.EPOCHS_PER_SYNC_COMMITTEE_PERIOD);
}
exports.computeSyncPeriodAtEpoch = computeSyncPeriodAtEpoch;
function timeUntilNextEpoch(config, genesisTime) {
    const miliSecondsPerEpoch = lodestar_params_1.SLOTS_PER_EPOCH * config.SECONDS_PER_SLOT * 1000;
    const msFromGenesis = Date.now() - genesisTime * 1000;
    if (msFromGenesis >= 0) {
        return miliSecondsPerEpoch - (msFromGenesis % miliSecondsPerEpoch);
    }
    else {
        return Math.abs(msFromGenesis % miliSecondsPerEpoch);
    }
}
exports.timeUntilNextEpoch = timeUntilNextEpoch;
//# sourceMappingURL=clock.js.map