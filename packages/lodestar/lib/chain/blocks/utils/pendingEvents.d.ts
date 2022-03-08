import { ChainEventEmitter } from "../../emitter";
/**
 * Utility to buffer events and send them all at once afterwards
 */
export declare class PendingEvents {
    private readonly emitter;
    events: Parameters<ChainEventEmitter["emit"]>[];
    constructor(emitter: ChainEventEmitter);
    push: ChainEventEmitter["emit"];
    emit(): void;
}
//# sourceMappingURL=pendingEvents.d.ts.map