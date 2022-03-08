"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentInterval = exports.computeTimeAtSlot = exports.computeSlotsSinceEpochStart = exports.getCurrentSlot = exports.getSlotsSinceGenesis = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const _1 = require(".");
function getSlotsSinceGenesis(config, genesisTime) {
    const diffInSeconds = Date.now() / 1000 - genesisTime;
    return Math.floor(diffInSeconds / config.SECONDS_PER_SLOT);
}
exports.getSlotsSinceGenesis = getSlotsSinceGenesis;
function getCurrentSlot(config, genesisTime) {
    return lodestar_params_1.GENESIS_SLOT + getSlotsSinceGenesis(config, genesisTime);
}
exports.getCurrentSlot = getCurrentSlot;
function computeSlotsSinceEpochStart(slot, epoch) {
    const computeEpoch = epoch !== null && epoch !== void 0 ? epoch : (0, _1.computeEpochAtSlot)(slot);
    return slot - (0, _1.computeStartSlotAtEpoch)(computeEpoch);
}
exports.computeSlotsSinceEpochStart = computeSlotsSinceEpochStart;
function computeTimeAtSlot(config, slot, genesisTime) {
    return genesisTime + slot * config.SECONDS_PER_SLOT;
}
exports.computeTimeAtSlot = computeTimeAtSlot;
function getCurrentInterval(config, genesisTime, secondsIntoSlot) {
    const timePerInterval = Math.floor(config.SECONDS_PER_SLOT / lodestar_params_1.INTERVALS_PER_SLOT);
    return Math.floor(secondsIntoSlot / timePerInterval);
}
exports.getCurrentInterval = getCurrentInterval;
//# sourceMappingURL=slot.js.map