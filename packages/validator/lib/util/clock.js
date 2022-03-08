"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentSlotAround = exports.Clock = exports.TimeItem = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
var TimeItem;
(function (TimeItem) {
    TimeItem[TimeItem["Slot"] = 0] = "Slot";
    TimeItem[TimeItem["Epoch"] = 1] = "Epoch";
})(TimeItem = exports.TimeItem || (exports.TimeItem = {}));
class Clock {
    constructor(config, logger, opts) {
        this.fns = [];
        this.genesisTime = opts.genesisTime;
        this.config = config;
        this.logger = logger;
    }
    start(signal) {
        for (const { timeItem, fn } of this.fns) {
            this.runAtMostEvery(timeItem, signal, fn).catch((e) => {
                if (!(0, lodestar_utils_1.isErrorAborted)(e)) {
                    this.logger.error("runAtMostEvery", {}, e);
                }
            });
        }
    }
    runEverySlot(fn) {
        this.fns.push({ timeItem: TimeItem.Slot, fn });
    }
    runEveryEpoch(fn) {
        this.fns.push({ timeItem: TimeItem.Epoch, fn });
    }
    /** Miliseconds from now to a specific slot fraction */
    msToSlotFraction(slot, fraction) {
        const timeAt = this.genesisTime + this.config.SECONDS_PER_SLOT * (slot + fraction);
        return timeAt * 1000 - Date.now();
    }
    /**
     * If a task happens to take more than one slot to run, we might skip a slot. This is unfortunate,
     * however the alternative is to *always* process every slot, which has the chance of creating a
     * theoretically unlimited backlog of tasks. It was a conscious decision to choose to drop tasks
     * on an overloaded/latent system rather than overload it even more.
     */
    async runAtMostEvery(timeItem, signal, fn) {
        // Run immediatelly first
        let slot = (0, lodestar_beacon_state_transition_1.getCurrentSlot)(this.config, this.genesisTime);
        let slotOrEpoch = timeItem === TimeItem.Slot ? slot : (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot);
        while (!signal.aborted) {
            // Must catch fn() to ensure `sleep()` is awaited both for resolve and reject
            await fn(slotOrEpoch, signal).catch((e) => {
                if (!(0, lodestar_utils_1.isErrorAborted)(e))
                    this.logger.error("Error on runEvery fn", {}, e);
            });
            try {
                await (0, lodestar_utils_1.sleep)(this.timeUntilNext(timeItem), signal);
                // calling getCurrentSlot here may not be correct when we're close to the next slot
                // it's safe to call getCurrentSlotAround after we sleep
                slot = getCurrentSlotAround(this.config, this.genesisTime);
                slotOrEpoch = timeItem === TimeItem.Slot ? slot : (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(slot);
            }
            catch (e) {
                if (e instanceof lodestar_utils_1.ErrorAborted) {
                    return;
                }
                throw e;
            }
        }
    }
    timeUntilNext(timeItem) {
        const miliSecondsPerSlot = this.config.SECONDS_PER_SLOT * 1000;
        const msFromGenesis = Date.now() - this.genesisTime * 1000;
        if (timeItem === TimeItem.Slot) {
            if (msFromGenesis >= 0) {
                return miliSecondsPerSlot - (msFromGenesis % miliSecondsPerSlot);
            }
            else {
                return Math.abs(msFromGenesis % miliSecondsPerSlot);
            }
        }
        else {
            const miliSecondsPerEpoch = lodestar_params_1.SLOTS_PER_EPOCH * miliSecondsPerSlot;
            if (msFromGenesis >= 0) {
                return miliSecondsPerEpoch - (msFromGenesis % miliSecondsPerEpoch);
            }
            else {
                return Math.abs(msFromGenesis % miliSecondsPerEpoch);
            }
        }
    }
}
exports.Clock = Clock;
/**
 * Same to the spec but we use Math.round instead of Math.floor.
 */
function getCurrentSlotAround(config, genesisTime) {
    const diffInSeconds = Date.now() / 1000 - genesisTime;
    const slotsSinceGenesis = Math.round(diffInSeconds / config.SECONDS_PER_SLOT);
    return lodestar_params_1.GENESIS_SLOT + slotsSinceGenesis;
}
exports.getCurrentSlotAround = getCurrentSlotAround;
// function useEventStream() {
//   this.stream = this.events.getEventStream([BeaconEventType.BLOCK, BeaconEventType.HEAD, BeaconEventType.CHAIN_REORG]);
//   pipeToEmitter(this.stream, this).catch((e: Error) => {
//     this.logger.error("Error on stream pipe", {}, e);
//   });
//   // On stop
//   this.stream.stop();
//   this.stream = null;
// }
//# sourceMappingURL=clock.js.map