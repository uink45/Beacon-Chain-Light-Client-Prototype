"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devHandler = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_util_1 = require("node:util");
const rimraf_1 = __importDefault(require("rimraf"));
const node_path_1 = __importDefault(require("node:path"));
const ssz_1 = require("@chainsafe/ssz");
const abort_controller_1 = require("@chainsafe/abort-controller");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_1 = require("@chainsafe/lodestar");
const lodestar_validator_1 = require("@chainsafe/lodestar-validator");
const lodestar_db_1 = require("@chainsafe/lodestar-db");
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_config_1 = require("@chainsafe/lodestar-config");
const lodestar_params_2 = require("@chainsafe/lodestar-params");
const process_1 = require("../../util/process");
const config_1 = require("../../config");
const options_1 = require("../../options");
const handler_1 = require("../init/handler");
const util_1 = require("../../util");
const paths_1 = require("../beacon/paths");
const paths_2 = require("../validator/paths");
const version_1 = require("../../util/version");
/**
 * Run a beacon node with validator
 */
async function devHandler(args) {
    var _a, _b;
    await (0, util_1.initBLS)();
    const { beaconNodeOptions, config } = await (0, handler_1.initializeOptionsAndConfig)(args);
    // ENR setup
    const peerId = await (0, config_1.createPeerId)();
    const enr = (0, config_1.createEnr)(peerId);
    beaconNodeOptions.set({ network: { discv5: { enr } } });
    const enrArgs = (0, options_1.parseEnrArgs)(args);
    (0, config_1.overwriteEnrWithCliArgs)(enr, enrArgs, beaconNodeOptions.getWithDefaults());
    // Custom paths different than regular beacon, validator paths
    // network="dev" will store all data in separate dir than other networks
    args.network = "dev";
    const beaconPaths = (0, paths_1.getBeaconPaths)(args);
    const validatorPaths = (0, paths_2.getValidatorPaths)(args);
    const beaconDbDir = beaconPaths.dbDir;
    const validatorsDbDir = validatorPaths.validatorsDbDir;
    // Remove slashing protection db. Otherwise the validators won't be able to propose nor attest
    // until the clock reach a higher slot than the previous run of the dev command
    if (args.genesisTime === undefined) {
        await (0, node_util_1.promisify)(rimraf_1.default)(beaconDbDir);
        await (0, node_util_1.promisify)(rimraf_1.default)(validatorsDbDir);
    }
    (0, util_1.mkdir)(beaconDbDir);
    (0, util_1.mkdir)(validatorsDbDir);
    // TODO: Rename db.name to db.path or db.location
    beaconNodeOptions.set({ db: { name: beaconPaths.dbDir } });
    const options = beaconNodeOptions.getWithDefaults();
    // Genesis params
    const validatorCount = (_a = args.genesisValidators) !== null && _a !== void 0 ? _a : 8;
    const genesisTime = (_b = args.genesisTime) !== null && _b !== void 0 ? _b : Math.floor(Date.now() / 1000) + 5;
    // Set logger format to Eph with provided genesisTime
    if (args.logFormatGenesisTime === undefined)
        args.logFormatGenesisTime = genesisTime;
    // BeaconNode setup
    const libp2p = await (0, lodestar_1.createNodeJsLibp2p)(peerId, options.network, { peerStoreDir: beaconPaths.peerStoreDir });
    const logger = (0, util_1.getCliLogger)(args, beaconPaths, config);
    logger.info("Lodestar", { version: (0, version_1.getVersion)(), network: args.network });
    if (lodestar_params_2.ACTIVE_PRESET === lodestar_params_2.PresetName.minimal)
        logger.info("ACTIVE_PRESET == minimal preset");
    const db = new lodestar_1.BeaconDb({ config, controller: new lodestar_db_1.LevelDbController(options.db, { logger }) });
    await db.start();
    let anchorState;
    if (args.genesisStateFile) {
        const state = config
            .getForkTypes(lodestar_params_1.GENESIS_SLOT)
            .BeaconState.createTreeBackedFromBytes(await node_fs_1.default.promises.readFile(args.genesisStateFile));
        anchorState = await (0, lodestar_1.initStateFromAnchorState)(config, db, logger, state);
    }
    else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const eth1BlockHash = args.genesisEth1Hash ? (0, ssz_1.fromHexString)(args.genesisEth1Hash) : undefined;
        anchorState = await (0, lodestar_1.initStateFromAnchorState)(config, db, logger, await lodestar_1.nodeUtils.initDevState(config, db, validatorCount, { genesisTime, eth1BlockHash }));
    }
    const beaconConfig = (0, lodestar_config_1.createIBeaconConfig)(config, anchorState.genesisValidatorsRoot);
    const validators = [];
    const node = await lodestar_1.BeaconNode.init({
        opts: options,
        config: beaconConfig,
        db,
        logger,
        libp2p,
        anchorState,
    });
    const onGracefulShutdownCbs = [];
    (0, process_1.onGracefulShutdown)(async () => {
        for (const cb of onGracefulShutdownCbs)
            await cb();
        await Promise.all([Promise.all(validators.map((v) => v.stop())), node.close()]);
        if (args.reset) {
            logger.info("Cleaning db directories");
            await (0, node_util_1.promisify)(rimraf_1.default)(beaconDbDir);
            await (0, node_util_1.promisify)(rimraf_1.default)(validatorsDbDir);
        }
    }, logger.info.bind(logger));
    if (args.startValidators) {
        const secretKeys = [];
        const [fromIndex, toIndex] = args.startValidators.split(":").map((s) => parseInt(s));
        const valCount = anchorState.validators.length;
        const maxIndex = fromIndex + valCount - 1;
        if (fromIndex > toIndex) {
            throw Error(`Invalid startValidators arg '${args.startValidators}' - fromIndex > toIndex`);
        }
        if (toIndex > maxIndex) {
            throw Error(`Invalid startValidators arg '${args.startValidators}' - state has ${valCount} validators`);
        }
        for (let i = fromIndex; i <= toIndex; i++) {
            secretKeys.push((0, lodestar_beacon_state_transition_1.interopSecretKey)(i));
        }
        const dbPath = node_path_1.default.join(validatorsDbDir, "validators");
        node_fs_1.default.mkdirSync(dbPath, { recursive: true });
        const api = args.server === "memory" ? node.api : args.server;
        const dbOps = {
            config: config,
            controller: new lodestar_db_1.LevelDbController({ name: dbPath }, { logger }),
        };
        const slashingProtection = new lodestar_validator_1.SlashingProtection(dbOps);
        const controller = new abort_controller_1.AbortController();
        onGracefulShutdownCbs.push(async () => controller.abort());
        // Initailize genesis once for all validators
        const validator = await lodestar_validator_1.Validator.initializeFromBeaconNode({
            dbOps,
            slashingProtection,
            api,
            logger: logger.child({ module: "vali" }),
            signers: secretKeys.map((secretKey) => ({
                type: lodestar_validator_1.SignerType.Local,
                secretKey,
            })),
        });
        onGracefulShutdownCbs.push(() => validator.stop());
        await validator.start();
    }
}
exports.devHandler = devHandler;
//# sourceMappingURL=handler.js.map