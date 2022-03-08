import { AbortSignal } from "@chainsafe/abort-controller";
import { phase0, Slot, allForks, RootHex } from "@chainsafe/lodestar-types";
import { CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { JobItemQueue } from "../../util/queue";
import { IStateRegenerator, RegenCaller } from "./interface";
import { RegenModules } from "./regen";
declare type QueuedStateRegeneratorModules = RegenModules & {
    signal: AbortSignal;
};
declare type RegenRequestKey = keyof IStateRegenerator;
declare type RegenRequestByKey = {
    [K in RegenRequestKey]: {
        key: K;
        args: Parameters<IStateRegenerator[K]>;
    };
};
export declare type RegenRequest = RegenRequestByKey[RegenRequestKey];
/**
 * Regenerates states that have already been processed by the fork choice
 *
 * All requests are queued so that only a single state at a time may be regenerated at a time
 */
export declare class QueuedStateRegenerator implements IStateRegenerator {
    readonly jobQueue: JobItemQueue<[RegenRequest], CachedBeaconStateAllForks>;
    private regen;
    private forkChoice;
    private stateCache;
    private checkpointStateCache;
    private metrics;
    constructor(modules: QueuedStateRegeneratorModules);
    /**
     * Get the state to run with `block`.
     * - State after `block.parentRoot` dialed forward to block.slot
     */
    getPreState(block: allForks.BeaconBlock, rCaller: RegenCaller): Promise<CachedBeaconStateAllForks>;
    getCheckpointState(cp: phase0.Checkpoint, rCaller: RegenCaller): Promise<CachedBeaconStateAllForks>;
    getBlockSlotState(blockRoot: RootHex, slot: Slot, rCaller: RegenCaller): Promise<CachedBeaconStateAllForks>;
    getState(stateRoot: RootHex, rCaller: RegenCaller): Promise<CachedBeaconStateAllForks>;
    private jobQueueProcessor;
}
export {};
//# sourceMappingURL=queued.d.ts.map