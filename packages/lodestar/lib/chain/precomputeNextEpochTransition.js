"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrecomputeNextEpochTransitionScheduler = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const emitter_1 = require("./emitter");
const regen_1 = require("./regen");
/**
 * When node is synced and 1/3 slot before an epoch, we want to prepare for the next epoch
 * transition from our head so that:
 * + validators vote for block head on time through attestation
 * + validators propose blocks on time
 */
class PrecomputeNextEpochTransitionScheduler {
    constructor(chain, config, metrics, logger, signal) {
        this.chain = chain;
        this.config = config;
        this.metrics = metrics;
        this.logger = logger;
        this.signal = signal;
        /**
         * Use clockSlot instead of clockEpoch to schedule the task at more exact time.
         */
        this.prepareForNextEpoch = async (clockSlot) => {
            var _a;
            // only interested in last slot of epoch
            if ((clockSlot + 1) % lodestar_params_1.SLOTS_PER_EPOCH !== 0) {
                return;
            }
            // Precalculate epoch transition 2/3 of the way through the last slot of the epoch
            const msToPrecalculateTime = (this.config.SECONDS_PER_SLOT * 1000 * 2) / 3;
            await (0, lodestar_utils_1.sleep)(msToPrecalculateTime, this.signal);
            const { slot: headSlot, blockRoot } = this.chain.forkChoice.getHead();
            const nextEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(clockSlot) + 1;
            // Don't want to pre compute epoch transition at pre genesis
            if (nextEpoch <= 0)
                return;
            // node may be syncing or out of synced
            if (headSlot < clockSlot) {
                (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.precomputeNextEpochTransition.count.inc({ result: "skip" }, 1);
                this.logger.debug("Skipping PrecomputeEpochScheduler - head slot is not current slot", {
                    nextEpoch,
                    headSlot,
                    slot: clockSlot,
                });
                return;
            }
            // we want to make sure headSlot === clockSlot to do early epoch transition
            const nextSlot = clockSlot + 1;
            this.logger.verbose("Running PrecomputeEpochScheduler", { nextEpoch, headSlot, nextSlot });
            // this takes 2s - 4s as of Oct 2021, no need to wait for this or the clock drift
            // assuming there is no reorg, it caches the checkpoint state & helps avoid doing a full state transition in the next slot
            //  + when gossip block comes, we need to validate and run state transition
            //  + if next slot is a skipped slot, it'd help getting target checkpoint state faster to validate attestations
            this.chain.regen
                .getBlockSlotState(blockRoot, nextSlot, regen_1.RegenCaller.precomputeEpoch)
                .then(() => {
                var _a, _b, _c;
                (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.precomputeNextEpochTransition.count.inc({ result: "success" }, 1);
                const previousHits = this.chain.checkpointStateCache.updatePreComputedCheckpoint(blockRoot, nextEpoch);
                if (previousHits === 0) {
                    (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.precomputeNextEpochTransition.waste.inc();
                }
                (_c = this.metrics) === null || _c === void 0 ? void 0 : _c.precomputeNextEpochTransition.hits.set(previousHits !== null && previousHits !== void 0 ? previousHits : 0);
                this.logger.verbose("Completed PrecomputeEpochScheduler", { nextEpoch, headSlot, nextSlot });
            })
                .catch((e) => {
                var _a;
                (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.precomputeNextEpochTransition.count.inc({ result: "error" }, 1);
                this.logger.error("Failed to precompute epoch transition", nextEpoch, e);
            });
        };
        this.chain.emitter.on(emitter_1.ChainEvent.clockSlot, this.prepareForNextEpoch);
        this.signal.addEventListener("abort", () => {
            this.chain.emitter.off(emitter_1.ChainEvent.clockSlot, this.prepareForNextEpoch);
        }, { once: true });
    }
}
exports.PrecomputeNextEpochTransitionScheduler = PrecomputeNextEpochTransitionScheduler;
//# sourceMappingURL=precomputeNextEpochTransition.js.map