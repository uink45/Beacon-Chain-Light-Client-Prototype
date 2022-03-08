import { Slot } from "@chainsafe/lodestar-types";
export declare type LightclientUpdateStats = {
    isFinalized: boolean;
    participation: number;
    slot: Slot;
};
/**
 * Returns the update with more bits. On ties, newUpdate is the better
 *
 * Spec v1.0.1
 * ```python
 * max(store.valid_updates, key=lambda update: sum(update.sync_committee_bits)))
 * ```
 */
export declare function isBetterUpdate(prev: LightclientUpdateStats, next: LightclientUpdateStats): boolean;
//# sourceMappingURL=update.d.ts.map