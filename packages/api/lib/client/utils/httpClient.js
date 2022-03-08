"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = exports.HttpError = void 0;
const cross_fetch_1 = require("cross-fetch");
const abort_controller_1 = require("@chainsafe/abort-controller");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const format_1 = require("./format");
class HttpError extends Error {
    constructor(message, status, url) {
        super(message);
        this.status = status;
        this.url = url;
    }
}
exports.HttpError = HttpError;
class HttpClient {
    /**
     * timeoutMs = config.params.SECONDS_PER_SLOT * 1000
     */
    constructor(opts) {
        var _a, _b;
        this.baseUrl = opts.baseUrl;
        // A higher default timeout, validator will sets its own shorter timeoutMs
        this.timeoutMs = (_a = opts.timeoutMs) !== null && _a !== void 0 ? _a : 60000;
        this.getAbortSignal = opts.getAbortSignal;
        this.fetch = (_b = opts.fetch) !== null && _b !== void 0 ? _b : cross_fetch_1.fetch;
    }
    async json(opts) {
        return await this.request(opts, (res) => res.json());
    }
    async arrayBuffer(opts) {
        return await this.request(opts, (res) => res.arrayBuffer());
    }
    async request(opts, getBody) {
        // Implement fetch timeout
        const controller = new abort_controller_1.AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        // Attach global signal to this request's controller
        const signalGlobal = this.getAbortSignal && this.getAbortSignal();
        if (signalGlobal) {
            signalGlobal.addEventListener("abort", () => controller.abort());
        }
        try {
            const url = (0, format_1.urlJoin)(this.baseUrl, opts.url) + (opts.query ? "?" + (0, format_1.stringifyQuery)(opts.query) : "");
            const headers = opts.headers || {};
            if (opts.body)
                headers["Content-Type"] = "application/json";
            const res = await this.fetch(url, {
                method: opts.method,
                headers: headers,
                body: opts.body ? JSON.stringify(opts.body) : undefined,
                signal: controller.signal,
            });
            if (!res.ok) {
                const errBody = await res.text();
                throw new HttpError(`${res.statusText}: ${getErrorMessage(errBody)}`, res.status, url);
            }
            return await getBody(res);
        }
        catch (e) {
            if (isAbortedError(e)) {
                if (signalGlobal === null || signalGlobal === void 0 ? void 0 : signalGlobal.aborted) {
                    throw new lodestar_utils_1.ErrorAborted("REST client");
                }
                else if (controller.signal.aborted) {
                    throw new lodestar_utils_1.TimeoutError("request");
                }
                else {
                    throw Error("Unknown aborted error");
                }
            }
            throw e;
        }
        finally {
            clearTimeout(timeout);
            if (signalGlobal) {
                signalGlobal.removeEventListener("abort", controller.abort);
            }
        }
    }
}
exports.HttpClient = HttpClient;
function isAbortedError(e) {
    return e.name === "AbortError" || e.message === "The user aborted a request";
}
function getErrorMessage(errBody) {
    try {
        const errJson = JSON.parse(errBody);
        if (errJson.message) {
            return errJson.message;
        }
        else {
            return errBody;
        }
    }
    catch (e) {
        return errBody;
    }
}
//# sourceMappingURL=httpClient.js.map