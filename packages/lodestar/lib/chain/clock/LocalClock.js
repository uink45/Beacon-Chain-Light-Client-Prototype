"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalClock = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const emitter_1 = require("../emitter");
const constants_1 = require("../../constants");
/**
 * A local clock, the clock time is assumed to be trusted
 */
class LocalClock {
    constructor({ config, genesisTime, emitter, signal, }) {
        this.onNextSlot = (slot) => {
            const clockSlot = slot !== null && slot !== void 0 ? slot : (0, lodestar_beacon_state_transition_1.getCurrentSlot)(this.config, this.genesisTime);
            // process multiple clock slots in the case the main thread has been saturated for > SECONDS_PER_SLOT
            while (this._currentSlot < clockSlot) {
                const previousSlot = this._currentSlot;
                this._currentSlot++;
                this.emitter.emit(emitter_1.ChainEvent.clockSlot, this._currentSlot);
                const previousEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(previousSlot);
                const currentEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(this._currentSlot);
                if (previousEpoch < currentEpoch) {
                    this.emitter.emit(emitter_1.ChainEvent.clockEpoch, currentEpoch);
                }
            }
            //recursively invoke onNextSlot
            this.timeoutId = setTimeout(this.onNextSlot, this.msUntilNextSlot());
        };
        this.config = config;
        this.genesisTime = genesisTime;
        this.timeoutId = setTimeout(this.onNextSlot, this.msUntilNextSlot());
        this.signal = signal;
        this.emitter = emitter;
        this._currentSlot = (0, lodestar_beacon_state_transition_1.getCurrentSlot)(this.config, this.genesisTime);
        this.signal.addEventListener("abort", () => clearTimeout(this.timeoutId), { once: true });
    }
    get currentSlot() {
        const slot = (0, lodestar_beacon_state_transition_1.getCurrentSlot)(this.config, this.genesisTime);
        if (slot > this._currentSlot) {
            clearTimeout(this.timeoutId);
            this.onNextSlot(slot);
        }
        return slot;
    }
    /**
     * If it's too close to next slot given MAXIMUM_GOSSIP_CLOCK_DISPARITY, return currentSlot + 1.
     * Otherwise return currentSlot
     */
    get currentSlotWithGossipDisparity() {
        const currentSlot = this.currentSlot;
        const nextSlotTime = (0, lodestar_beacon_state_transition_1.computeTimeAtSlot)(this.config, currentSlot + 1, this.genesisTime) * 1000;
        return nextSlotTime - Date.now() < constants_1.MAXIMUM_GOSSIP_CLOCK_DISPARITY ? currentSlot + 1 : currentSlot;
    }
    get currentEpoch() {
        return (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(this.currentSlot);
    }
    /** Returns the slot if the internal clock were advanced by `toleranceSec`. */
    slotWithFutureTolerance(toleranceSec) {
        // this is the same to getting slot at now + toleranceSec
        return (0, lodestar_beacon_state_transition_1.getCurrentSlot)(this.config, this.genesisTime - toleranceSec);
    }
    /** Returns the slot if the internal clock were reversed by `toleranceSec`. */
    slotWithPastTolerance(toleranceSec) {
        // this is the same to getting slot at now - toleranceSec
        return (0, lodestar_beacon_state_transition_1.getCurrentSlot)(this.config, this.genesisTime + toleranceSec);
    }
    /**
     * Check if a slot is current slot given MAXIMUM_GOSSIP_CLOCK_DISPARITY.
     */
    isCurrentSlotGivenGossipDisparity(slot) {
        const currentSlot = this.currentSlot;
        if (currentSlot === slot) {
            return true;
        }
        const nextSlotTime = (0, lodestar_beacon_state_transition_1.computeTimeAtSlot)(this.config, currentSlot + 1, this.genesisTime) * 1000;
        // we're too close to next slot, accept next slot
        if (nextSlotTime - Date.now() < constants_1.MAXIMUM_GOSSIP_CLOCK_DISPARITY) {
            return slot === currentSlot + 1;
        }
        const currentSlotTime = (0, lodestar_beacon_state_transition_1.computeTimeAtSlot)(this.config, currentSlot, this.genesisTime) * 1000;
        // we've just passed the current slot, accept previous slot
        if (Date.now() - currentSlotTime < constants_1.MAXIMUM_GOSSIP_CLOCK_DISPARITY) {
            return slot === currentSlot - 1;
        }
        return false;
    }
    async waitForSlot(slot) {
        if (this.signal.aborted) {
            throw new lodestar_utils_1.ErrorAborted();
        }
        if (this.currentSlot >= slot) {
            return;
        }
        return new Promise((resolve, reject) => {
            const onSlot = (clockSlot) => {
                if (clockSlot >= slot) {
                    onDone();
                }
            };
            const onDone = () => {
                this.emitter.off(emitter_1.ChainEvent.clockSlot, onSlot);
                this.signal.removeEventListener("abort", onAbort);
                resolve();
            };
            const onAbort = () => {
                this.emitter.off(emitter_1.ChainEvent.clockSlot, onSlot);
                reject(new lodestar_utils_1.ErrorAborted());
            };
            this.emitter.on(emitter_1.ChainEvent.clockSlot, onSlot);
            this.signal.addEventListener("abort", onAbort, { once: true });
        });
    }
    msUntilNextSlot() {
        const miliSecondsPerSlot = this.config.SECONDS_PER_SLOT * 1000;
        const diffInMiliSeconds = Date.now() - this.genesisTime * 1000;
        return miliSecondsPerSlot - (diffInMiliSeconds % miliSecondsPerSlot);
    }
}
exports.LocalClock = LocalClock;
//# sourceMappingURL=LocalClock.js.map