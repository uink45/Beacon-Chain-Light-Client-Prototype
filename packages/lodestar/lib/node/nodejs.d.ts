/**
 * @module node
 */
import { AbortController } from "@chainsafe/abort-controller";
import LibP2p from "libp2p";
import { Registry } from "prom-client";
import { TreeBacked } from "@chainsafe/ssz";
import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { allForks, phase0 } from "@chainsafe/lodestar-types";
import { ILogger } from "@chainsafe/lodestar-utils";
import { Api } from "@chainsafe/lodestar-api";
import { IBeaconDb } from "../db";
import { INetwork } from "../network";
import { IBeaconSync } from "../sync";
import { BackfillSync } from "../sync/backfill";
import { IBeaconChain } from "../chain";
import { IMetrics, HttpMetricsServer } from "../metrics";
import { RestApi } from "../api";
import { IBeaconNodeOptions } from "./options";
export * from "./options";
export interface IBeaconNodeModules {
    opts: IBeaconNodeOptions;
    config: IBeaconConfig;
    db: IBeaconDb;
    metrics: IMetrics | null;
    network: INetwork;
    chain: IBeaconChain;
    api: Api;
    sync: IBeaconSync;
    backfillSync: BackfillSync | null;
    metricsServer?: HttpMetricsServer;
    restApi?: RestApi;
    controller?: AbortController;
}
export interface IBeaconNodeInitModules {
    opts: IBeaconNodeOptions;
    config: IBeaconConfig;
    db: IBeaconDb;
    logger: ILogger;
    libp2p: LibP2p;
    anchorState: TreeBacked<allForks.BeaconState>;
    wsCheckpoint?: phase0.Checkpoint;
    metricsRegistries?: Registry[];
}
export declare enum BeaconNodeStatus {
    started = "started",
    closing = "closing",
    closed = "closed"
}
/**
 * The main Beacon Node class.  Contains various components for getting and processing data from the
 * eth2 ecosystem as well as systems for getting beacon node metadata.
 */
export declare class BeaconNode {
    opts: IBeaconNodeOptions;
    config: IBeaconConfig;
    db: IBeaconDb;
    metrics: IMetrics | null;
    metricsServer?: HttpMetricsServer;
    network: INetwork;
    chain: IBeaconChain;
    api: Api;
    restApi?: RestApi;
    sync: IBeaconSync;
    backfillSync: BackfillSync | null;
    status: BeaconNodeStatus;
    private controller?;
    constructor({ opts, config, db, metrics, metricsServer, network, chain, api, restApi, sync, backfillSync, controller, }: IBeaconNodeModules);
    /**
     * Initialize a beacon node.  Initializes and `start`s the varied sub-component services of the
     * beacon node
     */
    static init<T extends BeaconNode = BeaconNode>({ opts, config, db, logger, libp2p, anchorState, wsCheckpoint, metricsRegistries, }: IBeaconNodeInitModules): Promise<T>;
    /**
     * Stop beacon node and its sub-components.
     */
    close(): Promise<void>;
}
//# sourceMappingURL=nodejs.d.ts.map