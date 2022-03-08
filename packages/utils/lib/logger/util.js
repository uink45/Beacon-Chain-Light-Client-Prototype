"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatEpochSlotTime = void 0;
/**
 * Formats time as: `EPOCH/SLOT_INDEX SECONDS.MILISECONDS
 */
function formatEpochSlotTime(opts, now = Date.now()) {
    const nowSec = now / 1000;
    const secSinceGenesis = nowSec - opts.genesisTime;
    const epoch = Math.floor(secSinceGenesis / (opts.slotsPerEpoch * opts.secondsPerSlot));
    const epochStartSec = opts.genesisTime + epoch * opts.slotsPerEpoch * opts.secondsPerSlot;
    const secSinceStartEpoch = nowSec - epochStartSec;
    const slotIndex = Math.floor(secSinceStartEpoch / opts.secondsPerSlot);
    const slotSec = secSinceStartEpoch % opts.secondsPerSlot;
    return `Eph ${epoch}/${slotIndex} ${slotSec.toFixed(3)}`;
}
exports.formatEpochSlotTime = formatEpochSlotTime;
//# sourceMappingURL=util.js.map