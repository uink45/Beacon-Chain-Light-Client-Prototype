import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { ForkName } from "@chainsafe/lodestar-params";
import { Slot } from "@chainsafe/lodestar-types";
/**
 * Group an array of items by ForkName according to the slot associted to each item
 */
export declare function groupByFork<T>(config: IBeaconConfig, items: T[], getSlot: (item: T) => Slot): Map<ForkName, T[]>;
//# sourceMappingURL=forkName.d.ts.map