"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpMetricsServer = void 0;
/**
 * @module metrics/server
 */
const node_http_1 = __importDefault(require("node:http"));
const http_terminator_1 = require("http-terminator");
const prom_client_1 = require("prom-client");
const wrapError_1 = require("../../util/wrapError");
const histogram_1 = require("../utils/histogram");
class HttpMetricsServer {
    constructor(opts, { metrics, logger }) {
        this.opts = opts;
        this.logger = logger;
        this.register = metrics.register;
        this.http = node_http_1.default.createServer(this.onRequest.bind(this));
        this.terminator = (0, http_terminator_1.createHttpTerminator)({ server: this.http });
        // New registry to metric the metrics. Using the same registry would deadlock the .metrics promise
        this.httpServerRegister = new prom_client_1.Registry();
        this.scrapeTimeMetric = new histogram_1.HistogramExtra({
            name: "lodestar_metrics_scrape_seconds",
            help: "Time async to scrape metrics",
            labelNames: ["status"],
            buckets: [0.1, 1, 10],
        });
        this.httpServerRegister.registerMetric(this.scrapeTimeMetric);
    }
    async start() {
        const { serverPort, listenAddr } = this.opts;
        this.logger.info("Starting metrics HTTP server", { port: serverPort !== null && serverPort !== void 0 ? serverPort : null });
        const listen = this.http.listen.bind(this.http);
        return new Promise((resolve, reject) => {
            listen(serverPort, listenAddr).once("listening", resolve).once("error", reject);
        });
    }
    async stop() {
        try {
            await this.terminator.terminate();
        }
        catch (e) {
            this.logger.warn("Failed to stop metrics server", {}, e);
        }
    }
    async onRequest(req, res) {
        if (req.method === "GET" && req.url && req.url.includes("/metrics")) {
            const timer = this.scrapeTimeMetric.startTimer();
            const metricsRes = await (0, wrapError_1.wrapError)(this.register.metrics());
            timer({ status: metricsRes.err ? "error" : "success" });
            // Ensure we only writeHead once
            if (metricsRes.err) {
                res.writeHead(500, { "content-type": "text/plain" }).end(metricsRes.err.stack);
            }
            else {
                // Get scrape time metrics
                const httpServerMetrics = await this.httpServerRegister.metrics();
                const metricsStr = `${metricsRes.result}\n\n${httpServerMetrics}`;
                res.writeHead(200, { "content-type": this.register.contentType }).end(metricsStr);
            }
        }
        else {
            res.writeHead(404).end();
        }
    }
}
exports.HttpMetricsServer = HttpMetricsServer;
//# sourceMappingURL=http.js.map