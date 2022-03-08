import { ForkName } from "@chainsafe/lodestar-params";
import { IChainForkConfig, IForkInfo } from "@chainsafe/lodestar-config";
import { Epoch } from "@chainsafe/lodestar-types";
/**
 * Subscribe topics to the new fork N epochs before the fork. Remove all subscriptions N epochs after the fork
 *
 * This lookahead ensures a smooth fork transition. During `FORK_EPOCH_LOOKAHEAD` both forks will be active.
 *
 * ```
 *    phase0     phase0     phase0       -
 *      -        altair     altair     altair
 * |----------|----------|----------|----------|
 * 0        fork-2      fork      fork+2       oo
 * ```
 *
 * It the fork epochs are very close to each other there may more than two active at once
 *
 * ```
 *   f0    f0   f0    f0   f0    -
 *   -     fa   fa    fa   fa    fa   -
 *   -     -    fb    fb   fb    fb   fb
 *
 *     forka-2    forka      forka+2
 * |     |          |          |
 * |----------|----------|----------|----------|
 * 0        forkb-2    forkb      forkb+2      oo
 * ```
 */
export declare const FORK_EPOCH_LOOKAHEAD = 2;
/**
 * Return the list of `ForkName`s meant to be active at `epoch`
 * @see FORK_EPOCH_LOOKAHEAD for details on when forks are considered 'active'
 */
export declare function getActiveForks(config: IChainForkConfig, epoch: Epoch): ForkName[];
/**
 * Return the currentFork and nextFork given a fork schedule and `epoch`
 */
export declare function getCurrentAndNextFork(config: IChainForkConfig, epoch: Epoch): {
    currentFork: IForkInfo;
    nextFork: IForkInfo | undefined;
};
//# sourceMappingURL=forks.d.ts.map