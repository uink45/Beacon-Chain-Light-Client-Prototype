"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCheckpointFromArg = exports.fetchWeakSubjectivityState = exports.enrsToNetworkConfig = exports.getInjectableBootEnrs = exports.parseBootnodesFile = exports.readBootnodes = exports.fetchBootnodes = exports.getGenesisFileUrl = exports.getNetworkBeaconNodeOptions = exports.getNetworkBeaconParams = exports.networkNames = void 0;
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const lodestar_api_1 = require("@chainsafe/lodestar-api");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
// eslint-disable-next-line no-restricted-imports
const multifork_1 = require("@chainsafe/lodestar/lib/util/multifork");
const node_fs_1 = __importDefault(require("node:fs"));
const got_1 = __importDefault(require("got"));
const mainnet = __importStar(require("./mainnet"));
const prater = __importStar(require("./prater"));
const kintsugi = __importStar(require("./kintsugi"));
exports.networkNames = ["mainnet", "prater", "kintsugi"];
function getNetworkData(network) {
    switch (network) {
        case "mainnet":
            return mainnet;
        case "prater":
            return prater;
        case "kintsugi":
            return kintsugi;
        default:
            throw Error(`Network not supported: ${network}`);
    }
}
function getNetworkBeaconParams(network) {
    return getNetworkData(network).chainConfig;
}
exports.getNetworkBeaconParams = getNetworkBeaconParams;
function getNetworkBeaconNodeOptions(network) {
    const { depositContractDeployBlock, bootEnrs } = getNetworkData(network);
    return {
        eth1: {
            depositContractDeployBlock,
        },
        network: {
            discv5: {
                enabled: true,
                bootEnrs,
            },
        },
    };
}
exports.getNetworkBeaconNodeOptions = getNetworkBeaconNodeOptions;
/**
 * Get genesisStateFile URL to download. Returns null if not available
 */
function getGenesisFileUrl(network) {
    return getNetworkData(network).genesisFileUrl;
}
exports.getGenesisFileUrl = getGenesisFileUrl;
/**
 * Fetches the latest list of bootnodes for a network
 * Bootnodes file is expected to contain bootnode ENR's concatenated by newlines
 */
async function fetchBootnodes(network) {
    const bootnodesFileUrl = getNetworkData(network).bootnodesFileUrl;
    const bootnodesFile = await got_1.default.get(bootnodesFileUrl).text();
    const enrs = [];
    for (const line of bootnodesFile.trim().split(/\r?\n/)) {
        // File may contain a row with '### Ethereum Node Records'
        // File may be YAML, with `- enr:-KG4QOWkRj`
        if (line.includes("enr:"))
            enrs.push("enr:" + line.split("enr:")[1]);
    }
    return enrs;
}
exports.fetchBootnodes = fetchBootnodes;
/**
 * Reads and parses a list of bootnodes for a network from a file.
 */
function readBootnodes(bootnodesFilePath) {
    const bootnodesFile = node_fs_1.default.readFileSync(bootnodesFilePath, "utf8");
    const bootnodes = parseBootnodesFile(bootnodesFile);
    if (bootnodes.length === 0) {
        throw new Error(`No bootnodes found on file ${bootnodesFilePath}`);
    }
    return bootnodes;
}
exports.readBootnodes = readBootnodes;
/**
 * Parses a file to get a list of bootnodes for a network.
 * Bootnodes file is expected to contain bootnode ENR's concatenated by newlines, or commas for
 * parsing plaintext, YAML, JSON and/or env files.
 */
function parseBootnodesFile(bootnodesFile) {
    const enrs = [];
    for (const line of bootnodesFile.trim().split(/\r?\n/)) {
        for (const entry of line.split(",")) {
            const sanitizedEntry = entry.replace(/['",[\]{}.]+/g, "").trim();
            if (sanitizedEntry.includes("enr:-")) {
                const parsedEnr = `enr:-${sanitizedEntry.split("enr:-")[1]}`;
                enrs.push(parsedEnr);
            }
        }
    }
    return enrs;
}
exports.parseBootnodesFile = parseBootnodesFile;
/**
 * Parses a file to get a list of bootnodes for a network if given a valid path,
 * and returns the bootnodes in an "injectable" network options format.
 */
function getInjectableBootEnrs(bootnodesFilepath) {
    const bootEnrs = readBootnodes(bootnodesFilepath);
    const injectableBootEnrs = enrsToNetworkConfig(bootEnrs);
    return injectableBootEnrs;
}
exports.getInjectableBootEnrs = getInjectableBootEnrs;
/**
 * Given an array of bootnodes, returns them in an injectable format
 */
function enrsToNetworkConfig(enrs) {
    return { network: { discv5: { bootEnrs: enrs } } };
}
exports.enrsToNetworkConfig = enrsToNetworkConfig;
/**
 * Fetch weak subjectivity state from a remote beacon node
 */
async function fetchWeakSubjectivityState(config, { weakSubjectivityServerUrl, weakSubjectivityCheckpoint }) {
    try {
        let wsCheckpoint;
        const api = (0, lodestar_api_1.getClient)(config, { baseUrl: weakSubjectivityServerUrl });
        if (weakSubjectivityCheckpoint) {
            wsCheckpoint = getCheckpointFromArg(weakSubjectivityCheckpoint);
        }
        else {
            const { data: { finalized }, } = await api.beacon.getStateFinalityCheckpoints("head");
            wsCheckpoint = finalized;
        }
        const stateSlot = wsCheckpoint.epoch * lodestar_params_1.SLOTS_PER_EPOCH;
        const stateBytes = await (config.getForkName(stateSlot) === lodestar_params_1.ForkName.phase0
            ? api.debug.getState(`${stateSlot}`, "ssz")
            : api.debug.getStateV2(`${stateSlot}`, "ssz"));
        return { wsState: (0, multifork_1.getStateTypeFromBytes)(config, stateBytes).createTreeBackedFromBytes(stateBytes), wsCheckpoint };
    }
    catch (e) {
        throw new Error("Unable to fetch weak subjectivity state: " + e.message);
    }
}
exports.fetchWeakSubjectivityState = fetchWeakSubjectivityState;
function getCheckpointFromArg(checkpointStr) {
    const checkpointRegex = new RegExp("^(?:0x)?([0-9a-f]{64}):([0-9]+)$");
    const match = checkpointRegex.exec(checkpointStr.toLowerCase());
    if (!match) {
        throw new Error(`Could not parse checkpoint string: ${checkpointStr}`);
    }
    return { root: (0, lodestar_utils_1.fromHex)(match[1]), epoch: parseInt(match[2]) };
}
exports.getCheckpointFromArg = getCheckpointFromArg;
//# sourceMappingURL=index.js.map