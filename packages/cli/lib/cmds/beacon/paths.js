"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultBeaconPaths = exports.getBeaconPaths = void 0;
const node_path_1 = __importDefault(require("node:path"));
const global_1 = require("../../paths/global");
/**
 * Defines the path structure of the files relevant to the beacon node
 *
 * ```bash
 * $rootDir
 * └── $beaconDir
 *     ├── beacon.config.json
 *     ├── peer-id.json
 *     ├── enr
 *     └── chain-db
 * ```
 */
// Using Pick<IGlobalArgs, "rootDir"> make changes in IGlobalArgs throw a type error here
function getBeaconPaths(args) {
    // Compute global paths first
    const globalPaths = (0, global_1.getGlobalPaths)(args);
    const rootDir = globalPaths.rootDir;
    const beaconDir = rootDir;
    const dbDir = args.dbDir || node_path_1.default.join(beaconDir, "chain-db");
    const persistInvalidSszObjectsDir = args.persistInvalidSszObjectsDir || node_path_1.default.join(beaconDir, "invalidSszObjects");
    const peerStoreDir = args.peerStoreDir || node_path_1.default.join(beaconDir, "peerstore");
    const configFile = args.configFile;
    const peerIdFile = args.peerIdFile || node_path_1.default.join(beaconDir, "peer-id.json");
    const enrFile = args.enrFile || node_path_1.default.join(beaconDir, "enr");
    const logFile = args.logFile;
    const bootnodesFile = args.bootnodesFile;
    return {
        ...globalPaths,
        beaconDir,
        dbDir,
        persistInvalidSszObjectsDir,
        configFile,
        peerStoreDir,
        peerIdFile,
        enrFile,
        logFile,
        bootnodesFile,
    };
}
exports.getBeaconPaths = getBeaconPaths;
/**
 * Constructs representations of the path structure to show in command's description
 */
exports.defaultBeaconPaths = getBeaconPaths({ rootDir: "$rootDir" });
//# sourceMappingURL=paths.js.map