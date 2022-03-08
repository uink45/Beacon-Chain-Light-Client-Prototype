import { IChainConfig } from "@chainsafe/lodestar-config";
import { Epoch, Slot, SyncPeriod } from "@chainsafe/lodestar-types";
export declare function getCurrentSlot(config: IChainConfig, genesisTime: number): Slot;
/** Returns the slot if the internal clock were advanced by `toleranceSec`. */
export declare function slotWithFutureTolerance(config: IChainConfig, genesisTime: number, toleranceSec: number): Slot;
/**
 * Return the epoch number at the given slot.
 */
export declare function computeEpochAtSlot(slot: Slot): Epoch;
/**
 * Return the sync committee period at slot
 */
export declare function computeSyncPeriodAtSlot(slot: Slot): SyncPeriod;
/**
 * Return the sync committee period at epoch
 */
export declare function computeSyncPeriodAtEpoch(epoch: Epoch): SyncPeriod;
export declare function timeUntilNextEpoch(config: Pick<IChainConfig, "SECONDS_PER_SLOT">, genesisTime: number): number;
//# sourceMappingURL=clock.d.ts.map