import { AbortSignal } from "@chainsafe/abort-controller";
import { Epoch, Slot } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { ChainEventEmitter } from "../emitter";
import { IBeaconClock } from "./interface";
/**
 * A local clock, the clock time is assumed to be trusted
 */
export declare class LocalClock implements IBeaconClock {
    private readonly config;
    private readonly genesisTime;
    private timeoutId;
    private readonly emitter;
    private readonly signal;
    private _currentSlot;
    constructor({ config, genesisTime, emitter, signal, }: {
        config: IChainForkConfig;
        genesisTime: number;
        emitter: ChainEventEmitter;
        signal: AbortSignal;
    });
    get currentSlot(): Slot;
    /**
     * If it's too close to next slot given MAXIMUM_GOSSIP_CLOCK_DISPARITY, return currentSlot + 1.
     * Otherwise return currentSlot
     */
    get currentSlotWithGossipDisparity(): Slot;
    get currentEpoch(): Epoch;
    /** Returns the slot if the internal clock were advanced by `toleranceSec`. */
    slotWithFutureTolerance(toleranceSec: number): Slot;
    /** Returns the slot if the internal clock were reversed by `toleranceSec`. */
    slotWithPastTolerance(toleranceSec: number): Slot;
    /**
     * Check if a slot is current slot given MAXIMUM_GOSSIP_CLOCK_DISPARITY.
     */
    isCurrentSlotGivenGossipDisparity(slot: Slot): boolean;
    waitForSlot(slot: Slot): Promise<void>;
    private onNextSlot;
    private msUntilNextSlot;
}
//# sourceMappingURL=LocalClock.d.ts.map