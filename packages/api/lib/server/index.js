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
exports.registerRoutesGroup = exports.registerRoutes = void 0;
const beacon = __importStar(require("./beacon"));
const configApi = __importStar(require("./config"));
const debug = __importStar(require("./debug"));
const events = __importStar(require("./events"));
const lightclient = __importStar(require("./lightclient"));
const lodestar = __importStar(require("./lodestar"));
const node = __importStar(require("./node"));
const validator = __importStar(require("./validator"));
function registerRoutes(server, config, api, enabledNamespaces) {
    const routesByNamespace = {
        // Initializes route types and their definitions
        beacon: () => beacon.getRoutes(config, api.beacon),
        config: () => configApi.getRoutes(config, api.config),
        debug: () => debug.getRoutes(config, api.debug),
        events: () => events.getRoutes(config, api.events),
        lightclient: () => lightclient.getRoutes(config, api.lightclient),
        lodestar: () => lodestar.getRoutes(config, api.lodestar),
        node: () => node.getRoutes(config, api.node),
        validator: () => validator.getRoutes(config, api.validator),
    };
    for (const namespace of enabledNamespaces) {
        const routes = routesByNamespace[namespace];
        if (routes === undefined) {
            throw Error(`Unknown api namespace ${namespace}`);
        }
        registerRoutesGroup(server, routes());
    }
}
exports.registerRoutes = registerRoutes;
function registerRoutesGroup(fastify, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
routes) {
    for (const route of Object.values(routes)) {
        fastify.route({
            url: route.url,
            method: route.method,
            handler: route.handler,
            schema: route.schema,
            config: { operationId: route.id },
        });
    }
}
exports.registerRoutesGroup = registerRoutesGroup;
//# sourceMappingURL=index.js.map