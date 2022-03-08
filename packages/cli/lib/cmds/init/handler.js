"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistOptionsAndConfig = exports.initializeOptionsAndConfig = exports.initHandler = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const config_1 = require("../../config");
const options_1 = require("../../options");
const util_1 = require("../../util");
const networks_1 = require("../../networks");
const paths_1 = require("../beacon/paths");
/**
 * Initialize lodestar-cli with an on-disk configuration
 */
async function initHandler(args) {
    const { beaconNodeOptions, config } = await initializeOptionsAndConfig(args);
    await persistOptionsAndConfig(args);
    return { beaconNodeOptions, config };
}
exports.initHandler = initHandler;
async function initializeOptionsAndConfig(args) {
    var _a;
    const beaconPaths = (0, paths_1.getBeaconPaths)(args);
    const beaconNodeOptions = new config_1.BeaconNodeOptions({
        network: args.network || "mainnet",
        configFile: beaconPaths.configFile,
        bootnodesFile: beaconPaths.bootnodesFile,
        beaconNodeOptionsCli: (0, options_1.parseBeaconNodeArgs)(args),
    });
    // Auto-setup network
    // Only download files if network.discv5.bootEnrs arg is not specified
    const bOpts = beaconNodeOptions.get();
    const bOptsEnrs = bOpts.network && bOpts.network.discv5 && bOpts.network.discv5.bootEnrs;
    if (args.network && !(bOptsEnrs && bOptsEnrs.length > 0)) {
        try {
            const bootEnrs = await (0, networks_1.fetchBootnodes)(args.network);
            beaconNodeOptions.set({ network: { discv5: { bootEnrs } } });
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Error fetching latest bootnodes: ${e.stack}`);
        }
    }
    // Apply port option
    if (args.port !== undefined) {
        beaconNodeOptions.set({ network: { localMultiaddrs: [`/ip4/0.0.0.0/tcp/${args.port}`] } });
        const discoveryPort = (_a = args.discoveryPort) !== null && _a !== void 0 ? _a : args.port;
        beaconNodeOptions.set({ network: { discv5: { bindAddr: `/ip4/0.0.0.0/udp/${discoveryPort}` } } });
    }
    else if (args.discoveryPort !== undefined) {
        beaconNodeOptions.set({ network: { discv5: { bindAddr: `/ip4/0.0.0.0/udp/${args.discoveryPort}` } } });
    }
    // initialize params file, if it doesn't exist
    const config = (0, config_1.getBeaconConfigFromArgs)(args);
    return { beaconNodeOptions, config };
}
exports.initializeOptionsAndConfig = initializeOptionsAndConfig;
/**
 * Write options and configs to disk
 */
async function persistOptionsAndConfig(args) {
    const beaconPaths = (0, paths_1.getBeaconPaths)(args);
    // initialize directories
    (0, util_1.mkdir)(beaconPaths.rootDir);
    (0, util_1.mkdir)(beaconPaths.beaconDir);
    (0, util_1.mkdir)(beaconPaths.dbDir);
    // Initialize peerId if does not exist
    if (!node_fs_1.default.existsSync(beaconPaths.peerIdFile)) {
        await (0, config_1.initPeerId)(beaconPaths.peerIdFile);
    }
    const peerId = await (0, config_1.readPeerId)(beaconPaths.peerIdFile);
    // Initialize ENR if does not exist
    if (!node_fs_1.default.existsSync(beaconPaths.enrFile)) {
        (0, config_1.initEnr)(beaconPaths.enrFile, peerId);
    }
    else {
        // Verify that the peerId matches the ENR
        const enr = (0, config_1.readEnr)(beaconPaths.enrFile);
        const peerIdPrev = await enr.peerId();
        if (peerIdPrev.toB58String() !== peerId.toB58String()) {
            (0, config_1.initEnr)(beaconPaths.enrFile, peerId);
        }
    }
}
exports.persistOptionsAndConfig = persistOptionsAndConfig;
//# sourceMappingURL=handler.js.map