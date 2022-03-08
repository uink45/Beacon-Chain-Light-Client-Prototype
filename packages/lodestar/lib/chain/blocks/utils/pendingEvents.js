"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingEvents = void 0;
/**
 * Utility to buffer events and send them all at once afterwards
 */
class PendingEvents {
    constructor(emitter) {
        this.emitter = emitter;
        this.events = [];
        this.push = (...args) => {
            this.events.push(args);
        };
    }
    emit() {
        for (const event of this.events) {
            this.emitter.emit(...event);
        }
    }
}
exports.PendingEvents = PendingEvents;
//# sourceMappingURL=pendingEvents.js.map