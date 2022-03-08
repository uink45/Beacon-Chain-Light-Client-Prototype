import { AbortSignal } from "@chainsafe/abort-controller";
import { ILogger } from "@chainsafe/lodestar-utils";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Epoch, Number64, Slot } from "@chainsafe/lodestar-types";
declare type RunEveryFn = (slot: Slot, signal: AbortSignal) => Promise<void>;
export interface IClock {
    readonly genesisTime: number;
    start(signal: AbortSignal): void;
    runEverySlot(fn: (slot: Slot, signal: AbortSignal) => Promise<void>): void;
    runEveryEpoch(fn: (epoch: Epoch, signal: AbortSignal) => Promise<void>): void;
    msToSlotFraction(slot: Slot, fraction: number): number;
}
export declare enum TimeItem {
    Slot = 0,
    Epoch = 1
}
export declare class Clock implements IClock {
    readonly genesisTime: number;
    private readonly config;
    private readonly logger;
    private readonly fns;
    constructor(config: IChainForkConfig, logger: ILogger, opts: {
        genesisTime: number;
    });
    start(signal: AbortSignal): void;
    runEverySlot(fn: RunEveryFn): void;
    runEveryEpoch(fn: RunEveryFn): void;
    /** Miliseconds from now to a specific slot fraction */
    msToSlotFraction(slot: Slot, fraction: number): number;
    /**
     * If a task happens to take more than one slot to run, we might skip a slot. This is unfortunate,
     * however the alternative is to *always* process every slot, which has the chance of creating a
     * theoretically unlimited backlog of tasks. It was a conscious decision to choose to drop tasks
     * on an overloaded/latent system rather than overload it even more.
     */
    private runAtMostEvery;
    private timeUntilNext;
}
/**
 * Same to the spec but we use Math.round instead of Math.floor.
 */
export declare function getCurrentSlotAround(config: IChainForkConfig, genesisTime: Number64): Slot;
export {};
//# sourceMappingURL=clock.d.ts.map