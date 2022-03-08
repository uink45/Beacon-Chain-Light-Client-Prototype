/**
 * @module chain/stateTransition/util
 */
import { Epoch, Slot, Root, phase0, allForks } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
/**
 * Return the block root at a recent [[slot]].
 */
export declare function getBlockRootAtSlot(state: allForks.BeaconState, slot: Slot): Root;
/**
 * Return the block root at the start of a recent [[epoch]].
 */
export declare function getBlockRoot(state: allForks.BeaconState, epoch: Epoch): Root;
/**
 * Return the block header corresponding to a block with ``state_root`` set to ``ZERO_HASH``.
 */
export declare function getTemporaryBlockHeader(config: IChainForkConfig, block: allForks.BeaconBlock): phase0.BeaconBlockHeader;
/**
 * Receives a BeaconBlock, and produces the corresponding BeaconBlockHeader.
 */
export declare function blockToHeader(config: IChainForkConfig, block: allForks.BeaconBlock): phase0.BeaconBlockHeader;
//# sourceMappingURL=blockRoot.d.ts.map