"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLoggerOptions = void 0;
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
exports.defaultLoggerOptions = {
    chain: {
        level: lodestar_utils_1.LogLevel[lodestar_utils_1.defaultLogLevel],
        module: "chain",
    },
    db: {
        level: lodestar_utils_1.LogLevel[lodestar_utils_1.defaultLogLevel],
        module: "db",
    },
    eth1: {
        level: lodestar_utils_1.LogLevel[lodestar_utils_1.defaultLogLevel],
        module: "eth1",
    },
    node: {
        level: lodestar_utils_1.LogLevel[lodestar_utils_1.defaultLogLevel],
        module: "node",
    },
    network: {
        level: lodestar_utils_1.LogLevel[lodestar_utils_1.defaultLogLevel],
        module: "network",
    },
    sync: {
        level: lodestar_utils_1.LogLevel[lodestar_utils_1.defaultLogLevel],
        module: "sync",
    },
    backfill: {
        level: lodestar_utils_1.LogLevel[lodestar_utils_1.defaultLogLevel],
        module: "backfill",
    },
    api: {
        level: lodestar_utils_1.LogLevel[lodestar_utils_1.defaultLogLevel],
        module: "api",
    },
    metrics: {
        level: lodestar_utils_1.LogLevel[lodestar_utils_1.defaultLogLevel],
        module: "metrics",
    },
};
//# sourceMappingURL=loggerOptions.js.map