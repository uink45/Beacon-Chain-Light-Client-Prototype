import { EventEmitter } from "events";
import StrictEventEmitter from "strict-event-emitter-types";
import { HeadEventData } from "./chainHeaderTracker";
export declare enum ValidatorEvent {
    /**
     * This event signals that the node chain has a new head.
     */
    chainHead = "chainHead"
}
export interface IValidatorEvents {
    [ValidatorEvent.chainHead]: (head: HeadEventData) => void;
}
declare const ValidatorEventEmitter_base: new () => StrictEventEmitter<EventEmitter, IValidatorEvents>;
/**
 * Emit important validator events.
 */
export declare class ValidatorEventEmitter extends ValidatorEventEmitter_base {
}
export {};
//# sourceMappingURL=emitter.d.ts.map