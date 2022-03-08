import { IChainConfig } from "@chainsafe/lodestar-config";
import { Number64, Slot, Epoch } from "@chainsafe/lodestar-types";
export declare function getSlotsSinceGenesis(config: IChainConfig, genesisTime: Number64): Slot;
export declare function getCurrentSlot(config: IChainConfig, genesisTime: Number64): Slot;
export declare function computeSlotsSinceEpochStart(slot: Slot, epoch?: Epoch): number;
export declare function computeTimeAtSlot(config: IChainConfig, slot: Slot, genesisTime: Number64): Number64;
export declare function getCurrentInterval(config: IChainConfig, genesisTime: Number64, secondsIntoSlot: number): number;
//# sourceMappingURL=slot.d.ts.map