import { Api } from "@chainsafe/lodestar-api";
import { ILogger } from "@chainsafe/lodestar-utils";
import { Slot, Root, RootHex } from "@chainsafe/lodestar-types";
import { ValidatorEventEmitter } from "./emitter";
export declare type HeadEventData = {
    slot: Slot;
    head: RootHex;
    previousDutyDependentRoot: RootHex;
    currentDutyDependentRoot: RootHex;
};
declare type RunEveryFn = (event: HeadEventData) => Promise<void>;
/**
 * Track the head slot/root using the event stream api "head".
 */
export declare class ChainHeaderTracker {
    private readonly logger;
    private readonly api;
    private readonly emitter;
    private headBlockSlot;
    private headBlockRoot;
    private readonly fns;
    constructor(logger: ILogger, api: Api, emitter: ValidatorEventEmitter);
    start(signal: AbortSignal): void;
    getCurrentChainHead(slot: Slot): Root | null;
    runOnNewHead(fn: RunEveryFn): void;
    private onHeadUpdate;
}
export {};
//# sourceMappingURL=chainHeaderTracker.d.ts.map