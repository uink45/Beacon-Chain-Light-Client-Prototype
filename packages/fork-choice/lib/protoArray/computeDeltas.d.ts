import { EffectiveBalanceIncrements } from "@chainsafe/lodestar-beacon-state-transition";
import { IVoteTracker } from "./interface";
/**
 * Returns a list of `deltas`, where there is one delta for each of the indices in `indices`
 *
 * The deltas are formed by a change between `oldBalances` and `newBalances`, and/or a change of vote in `votes`.
 *
 * ## Errors
 *
 * - If a value in `indices` is greater to or equal to `indices.length`.
 */
export declare function computeDeltas(indices: Map<string, number>, votes: IVoteTracker[], oldBalances: EffectiveBalanceIncrements, newBalances: EffectiveBalanceIncrements): number[];
//# sourceMappingURL=computeDeltas.d.ts.map