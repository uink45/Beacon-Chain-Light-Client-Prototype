"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.parseArgs = void 0;
const lodestar_1 = require("@chainsafe/lodestar");
function parseArgs(args) {
    return {
        enabled: args["metrics.enabled"],
        gatewayUrl: args["metrics.gatewayUrl"],
        serverPort: args["metrics.serverPort"],
        timeout: args["metrics.timeout"],
        listenAddr: args["metrics.listenAddr"],
    };
}
exports.parseArgs = parseArgs;
exports.options = {
    "metrics.enabled": {
        type: "boolean",
        description: "Enable metrics",
        defaultDescription: String(lodestar_1.defaultOptions.metrics.enabled),
        group: "metrics",
    },
    "metrics.gatewayUrl": {
        type: "string",
        description: "Gateway URL for metrics",
        defaultDescription: lodestar_1.defaultOptions.metrics.gatewayUrl || "",
        group: "metrics",
    },
    "metrics.serverPort": {
        type: "number",
        description: "Server port for metrics",
        defaultDescription: String(lodestar_1.defaultOptions.metrics.serverPort),
        group: "metrics",
    },
    "metrics.timeout": {
        type: "number",
        description: "How often metrics should be probed",
        defaultDescription: String(lodestar_1.defaultOptions.metrics.timeout),
        group: "metrics",
    },
    "metrics.listenAddr": {
        type: "string",
        description: "The address for the metrics http server to listen on",
        defaultDescription: String(lodestar_1.defaultOptions.metrics.listenAddr),
        group: "metrics",
    },
};
//# sourceMappingURL=metrics.js.map