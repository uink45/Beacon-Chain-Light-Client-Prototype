"use strict";
/**
 * @module node
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeaconNode = exports.BeaconNodeStatus = void 0;
const abort_controller_1 = require("@chainsafe/abort-controller");
const network_1 = require("../network");
const sync_1 = require("../sync");
const backfill_1 = require("../sync/backfill");
const chain_1 = require("../chain");
const metrics_1 = require("../metrics");
const api_1 = require("../api");
const executionEngine_1 = require("../executionEngine");
const eth1_1 = require("../eth1");
const notifier_1 = require("./notifier");
__exportStar(require("./options"), exports);
var BeaconNodeStatus;
(function (BeaconNodeStatus) {
    BeaconNodeStatus["started"] = "started";
    BeaconNodeStatus["closing"] = "closing";
    BeaconNodeStatus["closed"] = "closed";
})(BeaconNodeStatus = exports.BeaconNodeStatus || (exports.BeaconNodeStatus = {}));
/**
 * The main Beacon Node class.  Contains various components for getting and processing data from the
 * eth2 ecosystem as well as systems for getting beacon node metadata.
 */
class BeaconNode {
    constructor({ opts, config, db, metrics, metricsServer, network, chain, api, restApi, sync, backfillSync, controller, }) {
        this.opts = opts;
        this.config = config;
        this.metrics = metrics;
        this.metricsServer = metricsServer;
        this.db = db;
        this.chain = chain;
        this.api = api;
        this.restApi = restApi;
        this.network = network;
        this.sync = sync;
        this.backfillSync = backfillSync;
        this.controller = controller;
        this.status = BeaconNodeStatus.started;
    }
    /**
     * Initialize a beacon node.  Initializes and `start`s the varied sub-component services of the
     * beacon node
     */
    static async init({ opts, config, db, logger, libp2p, anchorState, wsCheckpoint, metricsRegistries = [], }) {
        const controller = new abort_controller_1.AbortController();
        const signal = controller.signal;
        // start db if not already started
        await db.start();
        const metrics = opts.metrics.enabled ? (0, metrics_1.createMetrics)(opts.metrics, config, anchorState, metricsRegistries) : null;
        if (metrics) {
            (0, chain_1.initBeaconMetrics)(metrics, anchorState);
        }
        const chain = new chain_1.BeaconChain(opts.chain, {
            config,
            db,
            logger: logger.child(opts.logger.chain),
            metrics,
            anchorState,
            eth1: (0, eth1_1.initializeEth1ForBlockProduction)(opts.eth1, { config, db, logger: logger.child(opts.logger.eth1), signal }, anchorState),
            executionEngine: (0, executionEngine_1.initializeExecutionEngine)(opts.executionEngine, signal),
        });
        // Load persisted data from disk to in-memory caches
        await chain.loadFromDisk();
        const network = new network_1.Network(opts.network, {
            config,
            libp2p,
            logger: logger.child(opts.logger.network),
            metrics,
            chain,
            reqRespHandlers: (0, network_1.getReqRespHandlers)({ db, chain }),
            signal,
        });
        const sync = new sync_1.BeaconSync(opts.sync, {
            config,
            db,
            chain,
            metrics,
            network,
            wsCheckpoint,
            logger: logger.child(opts.logger.sync),
        });
        const backfillSync = null;
        const api = (0, api_1.getApi)(opts.api, {
            config,
            logger: logger.child(opts.logger.api),
            db,
            sync,
            network,
            chain,
            metrics,
        });
        const metricsServer = undefined;
        const restApi = new api_1.RestApi(opts.api.rest, {
            config,
            logger: logger.child(opts.logger.api),
            api,
            metrics,
        });
        if (opts.api.rest.enabled) {
            await restApi.listen();
        }
        await network.start();
        void (0, notifier_1.runNodeNotifier)({ network, chain, sync, config, logger, signal });
        return new this({
            opts,
            config,
            db,
            metrics,
            metricsServer,
            network,
            chain,
            api,
            restApi,
            sync,
            backfillSync,
            controller,
        });
    }
    /**
     * Stop beacon node and its sub-components.
     */
    async close() {
        var _a;
        if (this.status === BeaconNodeStatus.started) {
            this.status = BeaconNodeStatus.closing;
            this.sync.close();
            (_a = this.backfillSync) === null || _a === void 0 ? void 0 : _a.close();
            await this.network.stop();
            if (this.metricsServer)
                await this.metricsServer.stop();
            if (this.restApi)
                await this.restApi.close();
            await this.chain.persistToDisk();
            this.chain.close();
            await this.db.stop();
            if (this.controller)
                this.controller.abort();
            this.status = BeaconNodeStatus.closed;
        }
    }
}
exports.BeaconNode = BeaconNode;
//# sourceMappingURL=nodejs.js.map