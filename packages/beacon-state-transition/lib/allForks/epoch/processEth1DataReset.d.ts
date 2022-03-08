import { EpochProcess, CachedBeaconStateAllForks } from "../../types";
/**
 * Reset eth1DataVotes tree every `EPOCHS_PER_ETH1_VOTING_PERIOD`.
 *
 * PERF: Almost no (constant) cost
 */
export declare function processEth1DataReset(state: CachedBeaconStateAllForks, epochProcess: EpochProcess): void;
//# sourceMappingURL=processEth1DataReset.d.ts.map