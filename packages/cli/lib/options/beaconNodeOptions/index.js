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
Object.defineProperty(exports, "__esModule", { value: true });
exports.beaconNodeOptions = exports.parseBeaconNodeArgs = void 0;
const util_1 = require("../../util");
const api = __importStar(require("./api"));
const chain = __importStar(require("./chain"));
const eth1 = __importStar(require("./eth1"));
const execution = __importStar(require("./execution"));
const logger = __importStar(require("./logger"));
const metrics = __importStar(require("./metrics"));
const network = __importStar(require("./network"));
const sync = __importStar(require("./sync"));
function parseBeaconNodeArgs(args) {
    // Remove undefined values to allow deepmerge to inject default values downstream
    return (0, util_1.removeUndefinedRecursive)({
        api: api.parseArgs(args),
        chain: chain.parseArgs(args),
        // db: {},
        eth1: eth1.parseArgs(args),
        executionEngine: execution.parseArgs(args),
        logger: logger.parseArgs(args),
        metrics: metrics.parseArgs(args),
        network: network.parseArgs(args),
        sync: sync.parseArgs(args),
    });
}
exports.parseBeaconNodeArgs = parseBeaconNodeArgs;
exports.beaconNodeOptions = {
    ...api.options,
    ...chain.options,
    ...eth1.options,
    ...execution.options,
    ...logger.options,
    ...metrics.options,
    ...network.options,
    ...sync.options,
};
//# sourceMappingURL=index.js.map