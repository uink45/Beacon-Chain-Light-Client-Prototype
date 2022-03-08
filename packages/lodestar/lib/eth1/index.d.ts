import { CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { allForks, Root } from "@chainsafe/lodestar-types";
import { IEth1ForBlockProduction, Eth1DataAndDeposits, IEth1Provider, PowMergeBlock } from "./interface";
import { Eth1DepositDataTrackerModules } from "./eth1DepositDataTracker";
import { Eth1MergeBlockTrackerModules } from "./eth1MergeBlockTracker";
import { Eth1Options } from "./options";
import { Eth1Provider } from "./provider/eth1Provider";
export { IEth1ForBlockProduction, IEth1Provider, Eth1Provider };
export declare function initializeEth1ForBlockProduction(opts: Eth1Options, modules: Pick<Eth1DepositDataTrackerModules, "db" | "config" | "logger" | "signal">, anchorState: allForks.BeaconState): IEth1ForBlockProduction;
export declare class Eth1ForBlockProduction implements IEth1ForBlockProduction {
    private readonly eth1DepositDataTracker;
    private readonly eth1MergeBlockTracker;
    constructor(opts: Eth1Options, modules: Eth1DepositDataTrackerModules & Eth1MergeBlockTrackerModules & {
        eth1Provider?: IEth1Provider;
    });
    getEth1DataAndDeposits(state: CachedBeaconStateAllForks): Promise<Eth1DataAndDeposits>;
    getTerminalPowBlock(): Root | null;
    mergeCompleted(): void;
    getPowBlock(powBlockHash: string): Promise<PowMergeBlock | null>;
}
/**
 * Disabled version of Eth1ForBlockProduction
 * May produce invalid blocks by not adding new deposits and voting for the same eth1Data
 */
export declare class Eth1ForBlockProductionDisabled implements IEth1ForBlockProduction {
    /**
     * Returns same eth1Data as in state and no deposits
     * May produce invalid blocks if deposits have to be added
     */
    getEth1DataAndDeposits(state: CachedBeaconStateAllForks): Promise<Eth1DataAndDeposits>;
    /**
     * Will miss the oportunity to propose the merge block but will still produce valid blocks
     */
    getTerminalPowBlock(): Root | null;
    mergeCompleted(): void;
    /** Will not be able to validate the merge block */
    getPowBlock(): Promise<never>;
}
//# sourceMappingURL=index.d.ts.map