"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainHeaderTracker = void 0;
const lodestar_api_1 = require("@chainsafe/lodestar-api");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const ssz_1 = require("@chainsafe/ssz");
const emitter_1 = require("./emitter");
const { EventType } = lodestar_api_1.routes.events;
/**
 * Track the head slot/root using the event stream api "head".
 */
class ChainHeaderTracker {
    constructor(logger, api, emitter) {
        this.logger = logger;
        this.api = api;
        this.emitter = emitter;
        this.headBlockSlot = lodestar_params_1.GENESIS_SLOT;
        this.headBlockRoot = null;
        this.fns = [];
        this.onHeadUpdate = (event) => {
            if (event.type === EventType.head) {
                const { message } = event;
                const { slot, block, previousDutyDependentRoot, currentDutyDependentRoot } = message;
                this.headBlockSlot = slot;
                this.headBlockRoot = (0, ssz_1.fromHexString)(block);
                const headEventData = {
                    slot: this.headBlockSlot,
                    head: block,
                    previousDutyDependentRoot: previousDutyDependentRoot,
                    currentDutyDependentRoot: currentDutyDependentRoot,
                };
                for (const fn of this.fns) {
                    fn(headEventData).catch((e) => this.logger.error("Error calling head event handler", e));
                }
                this.emitter.emit(emitter_1.ValidatorEvent.chainHead, headEventData);
                this.logger.verbose("Found new chain head", {
                    slot: slot,
                    head: block,
                    previouDuty: previousDutyDependentRoot,
                    currentDuty: currentDutyDependentRoot,
                });
            }
        };
    }
    start(signal) {
        this.api.events.eventstream([EventType.head], signal, this.onHeadUpdate);
        this.logger.verbose("Subscribed to head event");
    }
    getCurrentChainHead(slot) {
        if (slot >= this.headBlockSlot) {
            return this.headBlockRoot;
        }
        // We don't know head of an old block
        return null;
    }
    runOnNewHead(fn) {
        this.fns.push(fn);
    }
}
exports.ChainHeaderTracker = ChainHeaderTracker;
//# sourceMappingURL=chainHeaderTracker.js.map