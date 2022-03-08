import { RegistryMetricCreator } from "../utils/registryMetricCreator";
export declare type IBeaconMetrics = ReturnType<typeof createBeaconMetrics>;
/**
 * Metrics from:
 * https://github.com/ethereum/eth2.0-metrics/ and
 * https://hackmd.io/D5FmoeFZScim_squBFl8oA
 */
export declare function createBeaconMetrics(register: RegistryMetricCreator): {
    peers: import("../utils/gauge").GaugeExtra<string>;
    slot: import("../utils/gauge").GaugeExtra<string>;
    headSlot: import("../utils/gauge").GaugeExtra<string>;
    headRoot: import("../utils/gauge").GaugeExtra<string>;
    finalizedEpoch: import("../utils/gauge").GaugeExtra<string>;
    finalizedRoot: import("../utils/gauge").GaugeExtra<string>;
    currentJustifiedEpoch: import("../utils/gauge").GaugeExtra<string>;
    currentJustifiedRoot: import("../utils/gauge").GaugeExtra<string>;
    previousJustifiedEpoch: import("../utils/gauge").GaugeExtra<string>;
    previousJustifiedRoot: import("../utils/gauge").GaugeExtra<string>;
    currentValidators: import("../utils/gauge").GaugeExtra<"status">;
    previousValidators: import("../utils/gauge").GaugeExtra<"status">;
    currentLiveValidators: import("../utils/gauge").GaugeExtra<string>;
    previousLiveValidators: import("../utils/gauge").GaugeExtra<string>;
    pendingDeposits: import("../utils/gauge").GaugeExtra<string>;
    processedDepositsTotal: import("../utils/gauge").GaugeExtra<string>;
    pendingExits: import("../utils/gauge").GaugeExtra<string>;
    previousEpochOrphanedBlocks: import("../utils/gauge").GaugeExtra<string>;
    reorgEventsTotal: import("../utils/gauge").GaugeExtra<string>;
    currentEpochActiveGwei: import("../utils/gauge").GaugeExtra<string>;
    currentEpochSourceGwei: import("../utils/gauge").GaugeExtra<string>;
    currentEpochTargetGwei: import("../utils/gauge").GaugeExtra<string>;
    previousEpochActiveGwei: import("../utils/gauge").GaugeExtra<string>;
    previousEpochSourceGwei: import("../utils/gauge").GaugeExtra<string>;
    previousEpochTargetGwei: import("../utils/gauge").GaugeExtra<string>;
    observedEpochAttesters: import("../utils/gauge").GaugeExtra<string>;
    observedEpochAggregators: import("../utils/gauge").GaugeExtra<string>;
    forkChoiceFindHead: import("../utils/histogram").HistogramExtra<string>;
    forkChoiceRequests: import("../utils/gauge").GaugeExtra<string>;
    forkChoiceErrors: import("../utils/gauge").GaugeExtra<string>;
    forkChoiceChangedHead: import("../utils/gauge").GaugeExtra<string>;
    forkChoiceReorg: import("../utils/gauge").GaugeExtra<string>;
    reqRespOutgoingRequests: import("../utils/gauge").GaugeExtra<"method">;
    reqRespOutgoingErrors: import("../utils/gauge").GaugeExtra<"method">;
    reqRespIncomingRequests: import("../utils/gauge").GaugeExtra<"method">;
    reqRespIncomingErrors: import("../utils/gauge").GaugeExtra<"method">;
    reqRespDialErrors: import("../utils/gauge").GaugeExtra<string>;
    reqRespRateLimitErrors: import("../utils/gauge").GaugeExtra<"tracker">;
    blockProductionTime: import("../utils/histogram").HistogramExtra<string>;
    blockProductionRequests: import("../utils/gauge").GaugeExtra<string>;
    blockProductionSuccess: import("../utils/gauge").GaugeExtra<string>;
};
//# sourceMappingURL=beacon.d.ts.map