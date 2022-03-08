"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.parseArgs = void 0;
const lodestar_1 = require("@chainsafe/lodestar");
const enabledAll = "*";
function parseArgs(args) {
    return {
        maxGindicesInProof: args["api.maxGindicesInProof"],
        rest: {
            api: args["api.rest.api"],
            cors: args["api.rest.cors"],
            enabled: args["api.rest.enabled"],
            host: args["api.rest.host"],
            port: args["api.rest.port"],
        },
    };
}
exports.parseArgs = parseArgs;
exports.options = {
    "api.maxGindicesInProof": {
        hidden: true,
        type: "number",
        description: "Limit max number of gindices in a single proof request. DoS vector protection",
        defaultDescription: String(lodestar_1.defaultOptions.api.maxGindicesInProof),
        group: "api",
    },
    "api.rest.api": {
        type: "array",
        choices: [...lodestar_1.allNamespaces, enabledAll],
        description: `Pick namespaces to expose for HTTP API. Set to '${enabledAll}' to enable all namespaces`,
        defaultDescription: JSON.stringify(lodestar_1.defaultOptions.api.rest.api),
        group: "api",
        coerce: (namespaces) => {
            // Enable all
            if (namespaces.includes(enabledAll))
                return lodestar_1.allNamespaces;
            // Parse ["debug,lodestar"] to ["debug", "lodestar"]
            return namespaces.map((val) => val.split(",")).flat(1);
        },
    },
    "api.rest.cors": {
        type: "string",
        description: "Configures the Access-Control-Allow-Origin CORS header for HTTP API",
        defaultDescription: lodestar_1.defaultOptions.api.rest.cors,
        group: "api",
    },
    "api.rest.enabled": {
        type: "boolean",
        description: "Enable/disable HTTP API",
        defaultDescription: String(lodestar_1.defaultOptions.api.rest.enabled),
        group: "api",
    },
    "api.rest.host": {
        type: "string",
        description: "Set host for HTTP API",
        defaultDescription: lodestar_1.defaultOptions.api.rest.host,
        group: "api",
    },
    "api.rest.port": {
        type: "number",
        description: "Set port for HTTP API",
        defaultDescription: String(lodestar_1.defaultOptions.api.rest.port),
        group: "api",
    },
};
//# sourceMappingURL=api.js.map