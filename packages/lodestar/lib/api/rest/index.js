"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestApi = exports.restApiOptionsDefault = exports.allNamespaces = void 0;
const fastify_1 = __importDefault(require("fastify"));
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const querystring_1 = __importDefault(require("querystring"));
const server_1 = require("@chainsafe/lodestar-api/server");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const errors_1 = require("../impl/errors");
var lodestar_api_1 = require("@chainsafe/lodestar-api");
Object.defineProperty(exports, "allNamespaces", { enumerable: true, get: function () { return lodestar_api_1.allNamespaces; } });
exports.restApiOptionsDefault = {
    enabled: true,
    // ApiNamespace "debug" is not turned on by default
    api: ["beacon", "lightclient"],
    host: "127.0.0.1",
    port: 9596,
    cors: "*",
};
/**
 * REST API powered by `fastify` server.
 */
class RestApi {
    constructor(optsArg, modules) {
        this.activeRequests = new Set();
        // Apply opts defaults
        const opts = { ...exports.restApiOptionsDefault, ...optsArg };
        const server = (0, fastify_1.default)({
            logger: false,
            ajv: { customOptions: { coerceTypes: "array" } },
            querystringParser: querystring_1.default.parse,
        });
        // Instantiate and register the routes with matching namespace in `opts.api`
        (0, server_1.registerRoutes)(server, modules.config, modules.api, opts.api);
        // To parse our ApiError -> statusCode
        server.setErrorHandler((err, req, res) => {
            if (err.validation) {
                void res.status(400).send(err.validation);
            }
            else {
                // Convert our custom ApiError into status code
                const statusCode = err instanceof errors_1.ApiError ? err.statusCode : 500;
                void res.status(statusCode).send(err);
            }
        });
        if (opts.cors) {
            void server.register(fastify_cors_1.default, { origin: opts.cors });
        }
        // Log all incoming request to debug (before parsing). TODO: Should we hook latter in the lifecycle? https://www.fastify.io/docs/latest/Lifecycle/
        // Note: Must be an async method so fastify can continue the release lifecycle. Otherwise we must call done() or the request stalls
        server.addHook("onRequest", async (req) => {
            this.activeRequests.add(req.raw);
            const url = req.raw.url ? req.raw.url.split("?")[0] : "-";
            this.logger.debug(`Req ${req.id} ${req.ip} ${req.raw.method}:${url}`);
        });
        // Log after response
        server.addHook("onResponse", async (req, res) => {
            var _a;
            this.activeRequests.delete(req.raw);
            const { operationId } = res.context.config;
            this.logger.debug(`Res ${req.id} ${operationId} - ${res.raw.statusCode}`);
            if (modules.metrics) {
                (_a = modules.metrics) === null || _a === void 0 ? void 0 : _a.apiRestResponseTime.observe({ operationId }, res.getResponseTime() / 1000);
            }
        });
        server.addHook("onError", async (req, res, err) => {
            this.activeRequests.delete(req.raw);
            // Don't log ErrorAborted errors, they happen on node shutdown and are not usefull
            if (err instanceof lodestar_utils_1.ErrorAborted)
                return;
            // Don't log NodeISSyncing errors, they happen very frequently while syncing and the validator polls duties
            if (err instanceof errors_1.NodeIsSyncing)
                return;
            const { operationId } = res.context.config;
            this.logger.error(`Req ${req.id} ${operationId} error`, {}, err);
        });
        this.opts = opts;
        this.server = server;
        this.logger = modules.logger;
    }
    /**
     * Start the REST API server.
     */
    async listen() {
        // TODO: Consider if necessary. The consumer could just not call this function
        if (!this.opts.enabled)
            return;
        try {
            const address = await this.server.listen(this.opts.port, this.opts.host);
            this.logger.info("Started REST api server", { address, namespaces: this.opts.api.join(",") });
        }
        catch (e) {
            this.logger.error("Error starting REST api server", { host: this.opts.host, port: this.opts.port }, e);
            throw e;
        }
    }
    /**
     * Close the server instance and terminate all existing connections.
     */
    async close() {
        // In NodeJS land calling close() only causes new connections to be rejected.
        // Existing connections can prevent .close() from resolving for potentially forever.
        // In Lodestar case when the BeaconNode wants to close we will just abruptly terminate
        // all existing connections for a fast shutdown.
        // Inspired by https://github.com/gajus/http-terminator/
        for (const req of this.activeRequests) {
            req.destroy(Error("Closing"));
        }
        await this.server.close();
    }
}
exports.RestApi = RestApi;
//# sourceMappingURL=index.js.map