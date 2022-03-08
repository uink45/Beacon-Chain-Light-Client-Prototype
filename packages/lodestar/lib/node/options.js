"use strict";
/**
 * @module node
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOptions = exports.allNamespaces = void 0;
const options_1 = require("../api/options");
const options_2 = require("../chain/options");
const options_3 = require("../db/options");
const options_4 = require("../eth1/options");
const loggerOptions_1 = require("./loggerOptions");
const options_5 = require("../metrics/options");
const options_6 = require("../network/options");
const options_7 = require("../sync/options");
const executionEngine_1 = require("../executionEngine");
// Re-export so the CLI doesn't need to depend on lodestar-api
var index_1 = require("../api/rest/index");
Object.defineProperty(exports, "allNamespaces", { enumerable: true, get: function () { return index_1.allNamespaces; } });
exports.defaultOptions = {
    api: options_1.defaultApiOptions,
    chain: options_2.defaultChainOptions,
    db: options_3.defaultDbOptions,
    eth1: options_4.defaultEth1Options,
    executionEngine: executionEngine_1.defaultExecutionEngineOpts,
    logger: loggerOptions_1.defaultLoggerOptions,
    metrics: options_5.defaultMetricsOptions,
    network: options_6.defaultNetworkOptions,
    sync: options_7.defaultSyncOptions,
};
//# sourceMappingURL=options.js.map