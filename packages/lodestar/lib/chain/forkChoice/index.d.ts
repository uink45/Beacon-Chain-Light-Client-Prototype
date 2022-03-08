/**
 * @module chain/forkChoice
 */
import { Slot } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { ForkChoice } from "@chainsafe/lodestar-fork-choice";
import { CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { ChainEventEmitter } from "../emitter";
import { IMetrics } from "../../metrics";
export declare type ForkChoiceOpts = {
    terminalTotalDifficulty?: bigint;
    proposerBoostEnabled: boolean;
};
/**
 * Fork Choice extended with a ChainEventEmitter
 */
export declare function initializeForkChoice(config: IChainForkConfig, emitter: ChainEventEmitter, currentSlot: Slot, state: CachedBeaconStateAllForks, proposerBoostEnabled: boolean, metrics?: IMetrics | null): ForkChoice;
//# sourceMappingURL=index.d.ts.map