"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueuedStateRegenerator = void 0;
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const stateCache_1 = require("../stateCache");
const queue_1 = require("../../util/queue");
const interface_1 = require("./interface");
const regen_1 = require("./regen");
const errors_1 = require("./errors");
const ssz_1 = require("@chainsafe/ssz");
const REGEN_QUEUE_MAX_LEN = 256;
/**
 * Regenerates states that have already been processed by the fork choice
 *
 * All requests are queued so that only a single state at a time may be regenerated at a time
 */
class QueuedStateRegenerator {
    constructor(modules) {
        this.jobQueueProcessor = async (regenRequest) => {
            var _a, _b;
            const metricsLabels = {
                caller: regenRequest.args[regenRequest.args.length - 1],
                entrypoint: regenRequest.key,
            };
            let timer;
            try {
                timer = (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.regenFnCallDuration.startTimer(metricsLabels);
                switch (regenRequest.key) {
                    case "getPreState":
                        return await this.regen.getPreState(...regenRequest.args);
                    case "getCheckpointState":
                        return await this.regen.getCheckpointState(...regenRequest.args);
                    case "getBlockSlotState":
                        return await this.regen.getBlockSlotState(...regenRequest.args);
                    case "getState":
                        return await this.regen.getState(...regenRequest.args);
                }
            }
            catch (e) {
                (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.regenFnTotalErrors.inc(metricsLabels);
                throw e;
            }
            finally {
                if (timer)
                    timer();
            }
        };
        this.regen = new regen_1.StateRegenerator(modules);
        this.jobQueue = new queue_1.JobItemQueue(this.jobQueueProcessor, { maxLength: REGEN_QUEUE_MAX_LEN, signal: modules.signal }, modules.metrics ? modules.metrics.regenQueue : undefined);
        this.forkChoice = modules.forkChoice;
        this.stateCache = modules.stateCache;
        this.checkpointStateCache = modules.checkpointStateCache;
        this.metrics = modules.metrics;
    }
    /**
     * Get the state to run with `block`.
     * - State after `block.parentRoot` dialed forward to block.slot
     */
    async getPreState(block, rCaller) {
        var _a, _b;
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.regenFnCallTotal.inc({ caller: rCaller, entrypoint: interface_1.RegenFnName.getPreState });
        // First attempt to fetch the state from caches before queueing
        const parentRoot = (0, ssz_1.toHexString)(block.parentRoot);
        const parentBlock = this.forkChoice.getBlockHex(parentRoot);
        if (!parentBlock) {
            throw new errors_1.RegenError({
                code: errors_1.RegenErrorCode.BLOCK_NOT_IN_FORKCHOICE,
                blockRoot: block.parentRoot,
            });
        }
        const parentEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(parentBlock.slot);
        const blockEpoch = (0, lodestar_beacon_state_transition_1.computeEpochAtSlot)(block.slot);
        // Check the checkpoint cache (if the pre-state is a checkpoint state)
        if (parentEpoch < blockEpoch) {
            const checkpointState = this.checkpointStateCache.getLatest(parentRoot, blockEpoch);
            if (checkpointState) {
                return checkpointState;
            }
        }
        // Check the state cache, only if the state doesn't need to go through an epoch transition.
        // Otherwise the state transition may not be cached and wasted. Queue for regen since the
        // work required will still be significant.
        if (parentEpoch === blockEpoch) {
            const state = this.stateCache.get(parentBlock.stateRoot);
            if (state) {
                return state;
            }
        }
        // The state is not immediately available in the caches, enqueue the job
        (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.regenFnQueuedTotal.inc({ caller: rCaller, entrypoint: interface_1.RegenFnName.getPreState });
        return this.jobQueue.push({ key: "getPreState", args: [block, rCaller] });
    }
    async getCheckpointState(cp, rCaller) {
        var _a, _b;
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.regenFnCallTotal.inc({ caller: rCaller, entrypoint: interface_1.RegenFnName.getCheckpointState });
        // First attempt to fetch the state from cache before queueing
        const checkpointState = this.checkpointStateCache.get((0, stateCache_1.toCheckpointHex)(cp));
        if (checkpointState) {
            return checkpointState;
        }
        // The state is not immediately available in the caches, enqueue the job
        (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.regenFnQueuedTotal.inc({ caller: rCaller, entrypoint: interface_1.RegenFnName.getCheckpointState });
        return this.jobQueue.push({ key: "getCheckpointState", args: [cp, rCaller] });
    }
    async getBlockSlotState(blockRoot, slot, rCaller) {
        var _a;
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.regenFnCallTotal.inc({ caller: rCaller, entrypoint: interface_1.RegenFnName.getBlockSlotState });
        // The state is not immediately available in the caches, enqueue the job
        return this.jobQueue.push({ key: "getBlockSlotState", args: [blockRoot, slot, rCaller] });
    }
    async getState(stateRoot, rCaller) {
        var _a, _b;
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.regenFnCallTotal.inc({ caller: rCaller, entrypoint: interface_1.RegenFnName.getState });
        // First attempt to fetch the state from cache before queueing
        const state = this.stateCache.get(stateRoot);
        if (state) {
            return state;
        }
        // The state is not immediately available in the cache, enqueue the job
        (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.regenFnQueuedTotal.inc({ caller: rCaller, entrypoint: interface_1.RegenFnName.getState });
        return this.jobQueue.push({ key: "getState", args: [stateRoot, rCaller] });
    }
}
exports.QueuedStateRegenerator = QueuedStateRegenerator;
//# sourceMappingURL=queued.js.map