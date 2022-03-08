"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDbMetrics = exports.createMetrics = void 0;
/**
 * @module metrics
 */
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const prom_client_1 = require("prom-client");
const prometheus_gc_stats_1 = __importDefault(require("prometheus-gc-stats"));
const beacon_1 = require("./metrics/beacon");
const lodestar_1 = require("./metrics/lodestar");
const registryMetricCreator_1 = require("./utils/registryMetricCreator");
const validatorMonitor_1 = require("./validatorMonitor");
function createMetrics(opts, config, anchorState, registries = []) {
    const register = new registryMetricCreator_1.RegistryMetricCreator();
    const beacon = (0, beacon_1.createBeaconMetrics)(register);
    const lodestar = (0, lodestar_1.createLodestarMetrics)(register, opts.metadata, anchorState);
    const genesisTime = anchorState.genesisTime;
    const validatorMonitor = (0, validatorMonitor_1.createValidatorMonitor)(lodestar, config, genesisTime);
    // Register a single collect() function to run all validatorMonitor metrics
    lodestar.validatorMonitor.validatorsTotal.addCollect(() => {
        const clockSlot = (0, lodestar_beacon_state_transition_1.getCurrentSlot)(config, genesisTime);
        validatorMonitor.scrapeMetrics(clockSlot);
    });
    process.on("unhandledRejection", (_error) => {
        lodestar.unhandeledPromiseRejections.inc();
    });
    (0, prom_client_1.collectDefaultMetrics)({
        register,
        // eventLoopMonitoringPrecision with sampling rate in milliseconds
        eventLoopMonitoringPrecision: 10,
    });
    // Collects GC metrics using a native binding module
    // - nodejs_gc_runs_total: Counts the number of time GC is invoked
    // - nodejs_gc_pause_seconds_total: Time spent in GC in seconds
    // - nodejs_gc_reclaimed_bytes_total: The number of bytes GC has freed
    (0, prometheus_gc_stats_1.default)(register)();
    return { ...beacon, ...lodestar, ...validatorMonitor, register: prom_client_1.Registry.merge([register, ...registries]) };
}
exports.createMetrics = createMetrics;
function createDbMetrics() {
    const metrics = {
        dbReads: new prom_client_1.Counter({
            name: "lodestar_db_reads",
            labelNames: ["bucket"],
            help: "Number of db reads, contains bucket label.",
        }),
        dbWrites: new prom_client_1.Counter({
            name: "lodestar_db_writes",
            labelNames: ["bucket"],
            help: "Number of db writes and deletes, contains bucket label.",
        }),
    };
    const registry = new prom_client_1.Registry();
    registry.registerMetric(metrics.dbReads);
    registry.registerMetric(metrics.dbWrites);
    return { metrics, registry };
}
exports.createDbMetrics = createDbMetrics;
//# sourceMappingURL=metrics.js.map