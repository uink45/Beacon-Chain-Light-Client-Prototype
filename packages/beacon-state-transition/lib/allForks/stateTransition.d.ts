import { allForks, Slot } from "@chainsafe/lodestar-types";
import { ForkName } from "@chainsafe/lodestar-params";
import { IBeaconStateTransitionMetrics } from "../metrics";
import { CachedBeaconStateAllForks } from "../types";
declare type StateAllForks = CachedBeaconStateAllForks;
declare type UpgradeStateFn = (state: StateAllForks) => StateAllForks;
export declare const upgradeStateByFork: Record<Exclude<ForkName, ForkName.phase0>, UpgradeStateFn>;
/**
 * Implementation Note: follows the optimizations in protolambda's eth2fastspec (https://github.com/protolambda/eth2fastspec)
 */
export declare function stateTransition(state: CachedBeaconStateAllForks, signedBlock: allForks.SignedBeaconBlock, options?: {
    verifyStateRoot?: boolean;
    verifyProposer?: boolean;
    verifySignatures?: boolean;
}, metrics?: IBeaconStateTransitionMetrics | null): CachedBeaconStateAllForks;
/**
 * Multifork capable processBlock()
 *
 * Implementation Note: follows the optimizations in protolambda's eth2fastspec (https://github.com/protolambda/eth2fastspec)
 */
export declare function processBlock(postState: CachedBeaconStateAllForks, block: allForks.BeaconBlock, options?: {
    verifySignatures?: boolean;
}, metrics?: IBeaconStateTransitionMetrics | null): void;
/**
 * Like `processSlots` from the spec but additionally handles fork upgrades
 *
 * Implementation Note: follows the optimizations in protolambda's eth2fastspec (https://github.com/protolambda/eth2fastspec)
 */
export declare function processSlots(state: CachedBeaconStateAllForks, slot: Slot, metrics?: IBeaconStateTransitionMetrics | null): CachedBeaconStateAllForks;
export {};
//# sourceMappingURL=stateTransition.d.ts.map