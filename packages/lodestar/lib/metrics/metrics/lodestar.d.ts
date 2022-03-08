import { allForks } from "@chainsafe/lodestar-types";
import { RegistryMetricCreator } from "../utils/registryMetricCreator";
import { IMetricsOptions } from "../options";
export declare type ILodestarMetrics = ReturnType<typeof createLodestarMetrics>;
/**
 * Extra Lodestar custom metrics
 */
export declare function createLodestarMetrics(register: RegistryMetricCreator, metadata: IMetricsOptions["metadata"], anchorState?: allForks.BeaconState): {
    clockSlot: import("../utils/gauge").GaugeExtra<string>;
    peersByDirection: import("../utils/gauge").GaugeExtra<"direction">;
    peersByClient: import("../utils/gauge").GaugeExtra<"client">;
    peersSync: import("../utils/gauge").GaugeExtra<string>;
    peerConnectedEvent: import("../utils/gauge").GaugeExtra<"direction">;
    peerDisconnectedEvent: import("../utils/gauge").GaugeExtra<"direction">;
    peerGoodbyeReceived: import("../utils/gauge").GaugeExtra<"reason">;
    peerGoodbyeSent: import("../utils/gauge").GaugeExtra<"reason">;
    peersRequestedToConnect: import("../utils/gauge").GaugeExtra<string>;
    peersRequestedToDisconnect: import("../utils/gauge").GaugeExtra<string>;
    peersRequestedSubnetsToQuery: import("../utils/gauge").GaugeExtra<"type">;
    peersRequestedSubnetsPeerCount: import("../utils/gauge").GaugeExtra<"type">;
    discovery: {
        peersToConnect: import("../utils/gauge").GaugeExtra<string>;
        cachedENRsSize: import("../utils/gauge").GaugeExtra<string>;
        findNodeQueryRequests: import("../utils/gauge").GaugeExtra<"action">;
        findNodeQueryTime: import("../utils/histogram").HistogramExtra<string>;
        findNodeQueryEnrCount: import("../utils/gauge").GaugeExtra<string>;
        discoveredStatus: import("../utils/gauge").GaugeExtra<"status">;
        dialAttempts: import("../utils/gauge").GaugeExtra<string>;
        dialTime: import("../utils/histogram").HistogramExtra<"status">;
    };
    discv5: {
        kadTableSize: import("../utils/gauge").GaugeExtra<string>;
        lookupCount: import("../utils/gauge").GaugeExtra<string>;
        activeSessionCount: import("../utils/gauge").GaugeExtra<string>;
        connectedPeerCount: import("../utils/gauge").GaugeExtra<string>;
        sentMessageCount: import("../utils/gauge").GaugeExtra<"type">;
        rcvdMessageCount: import("../utils/gauge").GaugeExtra<"type">;
    };
    gossipPeer: {
        scoreByThreshold: import("../utils/gauge").GaugeExtra<"threshold">;
        score: import("../utils/avgMinMax").AvgMinMax<string>;
        scoreWeights: import("../utils/avgMinMax").AvgMinMax<"p" | "topic">;
    };
    gossipMesh: {
        peersByType: import("../utils/gauge").GaugeExtra<"type" | "fork">;
        peersByBeaconAttestationSubnet: import("../utils/gauge").GaugeExtra<"fork" | "subnet">;
        peersBySyncCommitteeSubnet: import("../utils/gauge").GaugeExtra<"fork" | "subnet">;
    };
    gossipTopic: {
        peersByType: import("../utils/gauge").GaugeExtra<"type" | "fork">;
        peersByBeaconAttestationSubnet: import("../utils/gauge").GaugeExtra<"fork" | "subnet">;
        peersBySyncCommitteeSubnet: import("../utils/gauge").GaugeExtra<"fork" | "subnet">;
    };
    gossipValidationAccept: import("../utils/gauge").GaugeExtra<"topic">;
    gossipValidationIgnore: import("../utils/gauge").GaugeExtra<"topic">;
    gossipValidationReject: import("../utils/gauge").GaugeExtra<"topic">;
    gossipValidationQueueLength: import("../utils/gauge").GaugeExtra<"topic">;
    gossipValidationQueueDroppedJobs: import("../utils/gauge").GaugeExtra<"topic">;
    gossipValidationQueueJobTime: import("../utils/histogram").HistogramExtra<"topic">;
    gossipValidationQueueJobWaitTime: import("../utils/histogram").HistogramExtra<"topic">;
    regenQueue: {
        length: import("../utils/gauge").GaugeExtra<string>;
        droppedJobs: import("../utils/gauge").GaugeExtra<string>;
        jobTime: import("../utils/histogram").HistogramExtra<string>;
        jobWaitTime: import("../utils/histogram").HistogramExtra<string>;
    };
    blockProcessorQueue: {
        length: import("../utils/gauge").GaugeExtra<string>;
        droppedJobs: import("../utils/gauge").GaugeExtra<string>;
        jobTime: import("../utils/histogram").HistogramExtra<string>;
        jobWaitTime: import("../utils/histogram").HistogramExtra<string>;
    };
    apiRestResponseTime: import("../utils/histogram").HistogramExtra<"operationId">;
    stfnEpochTransition: import("../utils/histogram").HistogramExtra<string>;
    stfnProcessBlock: import("../utils/histogram").HistogramExtra<string>;
    blsThreadPool: {
        jobsWorkerTime: import("../utils/gauge").GaugeExtra<"workerId">;
        successJobsSignatureSetsCount: import("../utils/gauge").GaugeExtra<string>;
        errorJobsSignatureSetsCount: import("../utils/gauge").GaugeExtra<string>;
        jobWaitTime: import("../utils/histogram").HistogramExtra<string>;
        queueLength: import("../utils/gauge").GaugeExtra<string>;
        totalJobsGroupsStarted: import("../utils/gauge").GaugeExtra<string>;
        totalJobsStarted: import("../utils/gauge").GaugeExtra<string>;
        totalSigSetsStarted: import("../utils/gauge").GaugeExtra<string>;
        batchRetries: import("../utils/gauge").GaugeExtra<string>;
        batchSigsSuccess: import("../utils/gauge").GaugeExtra<string>;
        latencyToWorker: import("../utils/histogram").HistogramExtra<string>;
        latencyFromWorker: import("../utils/histogram").HistogramExtra<string>;
        mainThreadDurationInThreadPool: import("../utils/histogram").HistogramExtra<string>;
    };
    blsSingleThread: {
        singleThreadDuration: import("../utils/histogram").HistogramExtra<string>;
    };
    syncStatus: import("../utils/gauge").GaugeExtra<string>;
    syncPeersBySyncType: import("../utils/gauge").GaugeExtra<"syncType">;
    syncSwitchGossipSubscriptions: import("../utils/gauge").GaugeExtra<"action">;
    syncRange: {
        syncChainsEvents: import("../utils/gauge").GaugeExtra<"syncType" | "event">;
        syncChains: import("../utils/gauge").GaugeExtra<"syncType">;
        syncChainsPeers: import("../utils/avgMinMax").AvgMinMax<"syncType">;
        syncChainHighestTargetSlotCompleted: import("../utils/gauge").GaugeExtra<string>;
    };
    syncUnknownBlock: {
        requests: import("../utils/gauge").GaugeExtra<string>;
        pendingBlocks: import("../utils/gauge").GaugeExtra<string>;
        knownBadBlocks: import("../utils/gauge").GaugeExtra<string>;
        processedBlocksSuccess: import("../utils/gauge").GaugeExtra<string>;
        processedBlocksError: import("../utils/gauge").GaugeExtra<string>;
        downloadedBlocksSuccess: import("../utils/gauge").GaugeExtra<string>;
        downloadedBlocksError: import("../utils/gauge").GaugeExtra<string>;
        removedBlocks: import("../utils/gauge").GaugeExtra<string>;
    };
    gossipBlock: {
        elappsedTimeTillReceived: import("../utils/histogram").HistogramExtra<string>;
        elappsedTimeTillProcessed: import("../utils/histogram").HistogramExtra<string>;
    };
    backfillSync: {
        backfilledTillSlot: import("../utils/gauge").GaugeExtra<string>;
        prevFinOrWsSlot: import("../utils/gauge").GaugeExtra<string>;
        totalBlocks: import("../utils/gauge").GaugeExtra<"method">;
        errors: import("../utils/gauge").GaugeExtra<string>;
        status: import("../utils/gauge").GaugeExtra<string>;
    };
    validatorMonitor: {
        validatorsTotal: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochOnChainBalance: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochOnChainAttesterHit: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochOnChainAttesterMiss: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochOnChainHeadAttesterHit: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochOnChainHeadAttesterMiss: import("../utils/gauge").GaugeExtra<"index">;
        prevOnChainAttesterCorrectHead: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochOnChainTargetAttesterHit: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochOnChainTargetAttesterMiss: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochOnChainInclusionDistance: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochAttestationsTotal: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochAttestationsMinDelaySeconds: import("../utils/histogram").HistogramExtra<"index">;
        prevEpochAttestationAggregateInclusions: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochAttestationBlockInclusions: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochAttestationBlockMinInclusionDistance: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochBeaconBlocksTotal: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochBeaconBlocksMinDelaySeconds: import("../utils/histogram").HistogramExtra<"index">;
        prevEpochAggregatesTotal: import("../utils/gauge").GaugeExtra<"index">;
        prevEpochAggregatesMinDelaySeconds: import("../utils/histogram").HistogramExtra<"index">;
        unaggregatedAttestationTotal: import("../utils/gauge").GaugeExtra<"index" | "src">;
        unaggregatedAttestationDelaySeconds: import("../utils/histogram").HistogramExtra<"index" | "src">;
        aggregatedAttestationTotal: import("../utils/gauge").GaugeExtra<"index" | "src">;
        aggregatedAttestationDelaySeconds: import("../utils/histogram").HistogramExtra<"index" | "src">;
        attestationInAggregateTotal: import("../utils/gauge").GaugeExtra<"index" | "src">;
        attestationInAggregateDelaySeconds: import("../utils/histogram").HistogramExtra<"index" | "src">;
        attestationInBlockTotal: import("../utils/gauge").GaugeExtra<"index">;
        attestationInBlockDelaySlots: import("../utils/histogram").HistogramExtra<"index">;
        beaconBlockTotal: import("../utils/gauge").GaugeExtra<"index" | "src">;
        beaconBlockDelaySeconds: import("../utils/histogram").HistogramExtra<"index" | "src">;
    };
    stateCache: {
        lookups: import("../utils/gauge").GaugeExtra<string>;
        hits: import("../utils/gauge").GaugeExtra<string>;
        adds: import("../utils/gauge").GaugeExtra<string>;
        size: import("../utils/gauge").GaugeExtra<string>;
        reads: import("../utils/avgMinMax").AvgMinMax<string>;
        secondsSinceLastRead: import("../utils/avgMinMax").AvgMinMax<string>;
    };
    cpStateCache: {
        lookups: import("../utils/gauge").GaugeExtra<string>;
        hits: import("../utils/gauge").GaugeExtra<string>;
        adds: import("../utils/gauge").GaugeExtra<string>;
        size: import("../utils/gauge").GaugeExtra<string>;
        epochSize: import("../utils/gauge").GaugeExtra<string>;
        reads: import("../utils/avgMinMax").AvgMinMax<string>;
        secondsSinceLastRead: import("../utils/avgMinMax").AvgMinMax<string>;
    };
    regenFnCallTotal: import("../utils/gauge").GaugeExtra<"entrypoint" | "caller">;
    regenFnQueuedTotal: import("../utils/gauge").GaugeExtra<"entrypoint" | "caller">;
    regenFnCallDuration: import("../utils/histogram").HistogramExtra<"entrypoint" | "caller">;
    regenFnTotalErrors: import("../utils/gauge").GaugeExtra<"entrypoint" | "caller">;
    unhandeledPromiseRejections: import("../utils/gauge").GaugeExtra<string>;
    precomputeNextEpochTransition: {
        count: import("prom-client").Counter<"result">;
        hits: import("../utils/gauge").GaugeExtra<string>;
        waste: import("prom-client").Counter<string>;
    };
    reprocessAttestations: {
        total: import("../utils/gauge").GaugeExtra<string>;
        resolve: import("../utils/gauge").GaugeExtra<string>;
        waitTimeBeforeResolve: import("../utils/gauge").GaugeExtra<string>;
        reject: import("../utils/gauge").GaugeExtra<"reason">;
        waitTimeBeforeReject: import("../utils/gauge").GaugeExtra<"reason">;
    };
    lightclientServer: {
        persistedUpdates: import("../utils/gauge").GaugeExtra<"type">;
    };
};
//# sourceMappingURL=lodestar.d.ts.map