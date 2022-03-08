import { Root, Slot } from "@chainsafe/lodestar-types";
/**
 * Sync this up to this target. Uses slot instead of epoch to re-use logic for finalized sync
 * and head sync. The root is used to uniquely identify this chain on different forks
 */
export declare type ChainTarget = {
    slot: Slot;
    root: Root;
};
export declare function computeMostCommonTarget(targets: ChainTarget[]): ChainTarget;
//# sourceMappingURL=chainTarget.d.ts.map