/// <reference types="node" />
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { allForks, Slot } from "@chainsafe/lodestar-types";
import { ContainerType } from "@chainsafe/ssz";
export declare function getSignedBlockTypeFromBytes(config: IChainForkConfig, bytes: Buffer | Uint8Array): ContainerType<allForks.SignedBeaconBlock>;
export declare function getSlotFromBytes(bytes: Buffer | Uint8Array): Slot;
export declare function getStateTypeFromBytes(config: IChainForkConfig, bytes: Buffer | Uint8Array): ContainerType<allForks.BeaconState>;
//# sourceMappingURL=multifork.d.ts.map