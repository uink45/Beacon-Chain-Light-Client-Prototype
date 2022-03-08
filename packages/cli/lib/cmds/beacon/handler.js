"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beaconHandler = void 0;
const abort_controller_1 = require("@chainsafe/abort-controller");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const lodestar_1 = require("@chainsafe/lodestar");
// eslint-disable-next-line no-restricted-imports
const metrics_1 = require("@chainsafe/lodestar/lib/metrics");
const lodestar_config_1 = require("@chainsafe/lodestar-config");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const enrOptions_1 = require("../../options/enrOptions");
const util_1 = require("../../util");
const config_1 = require("../../config");
const handler_1 = require("../init/handler");
const paths_1 = require("./paths");
const initBeaconState_1 = require("./initBeaconState");
const version_1 = require("../../util/version");
/**
 * Runs a beacon node.
 */
async function beaconHandler(args) {
    await (0, util_1.initBLS)();
    const { beaconNodeOptions, config } = await (0, handler_1.initializeOptionsAndConfig)(args);
    await (0, handler_1.persistOptionsAndConfig)(args);
    const version = (0, version_1.getVersion)();
    const gitData = (0, version_1.getVersionGitData)();
    const beaconPaths = (0, paths_1.getBeaconPaths)(args);
    // TODO: Rename db.name to db.path or db.location
    beaconNodeOptions.set({ db: { name: beaconPaths.dbDir } });
    beaconNodeOptions.set({ chain: { persistInvalidSszObjectsDir: beaconPaths.persistInvalidSszObjectsDir } });
    // Add metrics metadata to show versioning + network info in Prometheus + Grafana
    beaconNodeOptions.set({ metrics: { metadata: { ...gitData, version, network: args.network } } });
    // Add detailed version string for API node/version endpoint
    beaconNodeOptions.set({ api: { version: version } });
    // ENR setup
    const peerId = await (0, config_1.readPeerId)(beaconPaths.peerIdFile);
    const enr = config_1.FileENR.initFromFile(beaconPaths.enrFile, peerId);
    const enrArgs = (0, enrOptions_1.parseEnrArgs)(args);
    (0, config_1.overwriteEnrWithCliArgs)(enr, enrArgs, beaconNodeOptions.getWithDefaults());
    const enrUpdate = !enrArgs.ip && !enrArgs.ip6;
    beaconNodeOptions.set({ network: { discv5: { enr, enrUpdate } } });
    const options = beaconNodeOptions.getWithDefaults();
    const abortController = new abort_controller_1.AbortController();
    const logger = (0, util_1.getCliLogger)(args, beaconPaths, config);
    (0, util_1.onGracefulShutdown)(async () => {
        abortController.abort();
    }, logger.info.bind(logger));
    logger.info("Lodestar", { version: version, network: args.network });
    if (lodestar_params_1.ACTIVE_PRESET === lodestar_params_1.PresetName.minimal)
        logger.info("ACTIVE_PRESET == minimal preset");
    let dbMetrics = null;
    // additional metrics registries
    const metricsRegistries = [];
    if (options.metrics.enabled) {
        dbMetrics = (0, metrics_1.createDbMetrics)();
        metricsRegistries.push(dbMetrics.registry);
    }
    const db = new lodestar_1.BeaconDb({
        config,
        controller: new lodestar_db_1.LevelDbController(options.db, { logger: logger.child(options.logger.db) }),
        metrics: dbMetrics === null || dbMetrics === void 0 ? void 0 : dbMetrics.metrics,
    });
    await db.start();
    // BeaconNode setup
    try {
        const { anchorState, wsCheckpoint } = await (0, initBeaconState_1.initBeaconState)(options, args, config, db, logger, abortController.signal);
        const beaconConfig = (0, lodestar_config_1.createIBeaconConfig)(config, anchorState.genesisValidatorsRoot);
        const node = await lodestar_1.BeaconNode.init({
            opts: options,
            config: beaconConfig,
            db,
            logger,
            libp2p: await (0, lodestar_1.createNodeJsLibp2p)(peerId, options.network, { peerStoreDir: beaconPaths.peerStoreDir }),
            anchorState,
            wsCheckpoint,
            metricsRegistries,
        });
        abortController.signal.addEventListener("abort", () => node.close(), { once: true });
    }
    catch (e) {
        await db.stop();
        if (e instanceof lodestar_utils_1.ErrorAborted) {
            logger.info(e.message); // Let the user know the abort was received but don't print as error
        }
        else {
            throw e;
        }
    }
}
exports.beaconHandler = beaconHandler;
//# sourceMappingURL=handler.js.map