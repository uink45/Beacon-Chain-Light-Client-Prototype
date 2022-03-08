"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorEventEmitter = exports.ValidatorEvent = void 0;
const events_1 = require("events");
var ValidatorEvent;
(function (ValidatorEvent) {
    /**
     * This event signals that the node chain has a new head.
     */
    ValidatorEvent["chainHead"] = "chainHead";
})(ValidatorEvent = exports.ValidatorEvent || (exports.ValidatorEvent = {}));
/**
 * Emit important validator events.
 */
class ValidatorEventEmitter extends events_1.EventEmitter {
}
exports.ValidatorEventEmitter = ValidatorEventEmitter;
//# sourceMappingURL=emitter.js.map