"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRpcError = exports.ErrorJsonRpcResponse = exports.ErrorParseJson = exports.JsonRpcHttpClient = void 0;
// Uses cross-fetch for browser + NodeJS cross compatibility
// Note: isomorphic-fetch is not well mantained and does not support abort signals
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const abort_controller_1 = require("@chainsafe/abort-controller");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const jwt_1 = require("./jwt");
/**
 * Limits the amount of response text printed with RPC or parsing errors
 */
const maxStringLengthToPrint = 500;
const REQUEST_TIMEOUT = 30 * 1000;
class JsonRpcHttpClient {
    constructor(urls, opts) {
        this.urls = urls;
        this.opts = opts;
        this.id = 1;
        // Sanity check for all URLs to be properly defined. Otherwise it will error in loop on fetch
        if (urls.length === 0) {
            throw Error("No urls provided to JsonRpcHttpClient");
        }
        for (const [i, url] of urls.entries()) {
            if (!url) {
                throw Error(`JsonRpcHttpClient.urls[${i}] is empty or undefined: ${url}`);
            }
        }
        this.jwtSecret = opts === null || opts === void 0 ? void 0 : opts.jwtSecret;
    }
    /**
     * Perform RPC request
     */
    async fetch(payload, opts) {
        const res = await this.fetchJson({ jsonrpc: "2.0", id: this.id++, ...payload }, opts);
        return parseRpcResponse(res, payload);
    }
    /**
     * Perform RPC batched request
     * Type-wise assumes all requests results have the same type
     */
    async fetchBatch(rpcPayloadArr, opts) {
        if (rpcPayloadArr.length === 0)
            return [];
        const resArr = await this.fetchJson(rpcPayloadArr.map(({ method, params }) => ({ jsonrpc: "2.0", method, params, id: this.id++ })), opts);
        return resArr.map((res, i) => parseRpcResponse(res, rpcPayloadArr[i]));
    }
    async fetchJson(json, opts) {
        var _a, _b;
        let lastError = null;
        for (const url of this.urls) {
            try {
                return await this.fetchJsonOneUrl(url, json, opts);
            }
            catch (e) {
                if ((_b = (_a = this.opts) === null || _a === void 0 ? void 0 : _a.shouldNotFallback) === null || _b === void 0 ? void 0 : _b.call(_a, e)) {
                    throw e;
                }
                lastError = e;
            }
        }
        if (lastError !== null) {
            throw lastError;
        }
        else if (this.urls.length === 0) {
            throw Error("No url provided");
        }
        else {
            throw Error("Unknown error");
        }
    }
    /**
     * Fetches JSON and throws detailed errors in case the HTTP request is not ok
     */
    async fetchJsonOneUrl(url, json, opts) {
        var _a, _b, _c, _d, _e, _f;
        // If url is undefined node-fetch throws with `TypeError: Only absolute URLs are supported`
        // Throw a better error instead
        if (!url)
            throw Error(`Empty or undefined JSON RPC HTTP client url: ${url}`);
        // fetch() throws for network errors:
        // - request to http://missing-url.com/ failed, reason: getaddrinfo ENOTFOUND missing-url.com
        const controller = new abort_controller_1.AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, (_c = (_a = opts === null || opts === void 0 ? void 0 : opts.timeout) !== null && _a !== void 0 ? _a : (_b = this.opts) === null || _b === void 0 ? void 0 : _b.timeout) !== null && _c !== void 0 ? _c : REQUEST_TIMEOUT);
        const onParentSignalAbort = () => controller.abort();
        if ((_d = this.opts) === null || _d === void 0 ? void 0 : _d.signal) {
            this.opts.signal.addEventListener("abort", onParentSignalAbort, { once: true });
        }
        try {
            const headers = { "Content-Type": "application/json" };
            if (this.jwtSecret) {
                /**
                 * ELs have a tight +-5 second freshness check on token's iat i.e. issued at
                 * so its better to generate a new token each time. Currently iat is the only claim
                 * we are encoding but potentially we can encode more claims.
                 * Also currently the algorithm for the token generation is mandated to HS256
                 *
                 * Jwt auth spec: https://github.com/ethereum/execution-apis/pull/167
                 */
                const token = (0, jwt_1.encodeJwtToken)({ iat: Math.floor(new Date().getTime() / 1000) }, this.jwtSecret);
                headers["Authorization"] = `Bearer ${token}`;
            }
            const res = await (0, cross_fetch_1.default)(url, {
                method: "post",
                body: JSON.stringify(json),
                headers,
                signal: controller.signal,
            }).finally(() => {
                var _a, _b;
                clearTimeout(timeout);
                (_b = (_a = this.opts) === null || _a === void 0 ? void 0 : _a.signal) === null || _b === void 0 ? void 0 : _b.removeEventListener("abort", onParentSignalAbort);
            });
            const body = await res.text();
            if (!res.ok) {
                // Infura errors:
                // - No project ID: Forbidden: {"jsonrpc":"2.0","id":0,"error":{"code":-32600,"message":"project ID is required","data":{"reason":"project ID not provided","see":"https://infura.io/dashboard"}}}
                throw new HttpRpcError(res.status, `${res.statusText}: ${body.slice(0, maxStringLengthToPrint)}`);
            }
            return parseJson(body);
        }
        catch (e) {
            if (controller.signal.aborted) {
                // controller will abort on both parent signal abort + timeout of this specific request
                if ((_f = (_e = this.opts) === null || _e === void 0 ? void 0 : _e.signal) === null || _f === void 0 ? void 0 : _f.aborted) {
                    throw new lodestar_utils_1.ErrorAborted("request");
                }
                else {
                    throw new lodestar_utils_1.TimeoutError("request");
                }
            }
            else {
                throw e;
            }
        }
    }
}
exports.JsonRpcHttpClient = JsonRpcHttpClient;
function parseRpcResponse(res, payload) {
    if (res.result !== undefined) {
        return res.result;
    }
    else {
        throw new ErrorJsonRpcResponse(res, payload);
    }
}
/**
 * Util: Parse JSON but display the original source string in case of error
 * Helps debug instances where an API returns a plain text instead of JSON,
 * such as getting an HTML page due to a wrong API URL
 */
function parseJson(json) {
    try {
        return JSON.parse(json);
    }
    catch (e) {
        throw new ErrorParseJson(json, e);
    }
}
class ErrorParseJson extends Error {
    constructor(json, e) {
        super(`Error parsing JSON: ${e.message}\n${json.slice(0, maxStringLengthToPrint)}`);
    }
}
exports.ErrorParseJson = ErrorParseJson;
/** JSON RPC endpoint returned status code == 200, but with error property set */
class ErrorJsonRpcResponse extends Error {
    constructor(res, payload) {
        const errorMessage = res.error
            ? typeof res.error.message === "string"
                ? res.error.message
                : typeof res.error.code === "number"
                    ? parseJsonRpcErrorCode(res.error.code)
                    : JSON.stringify(res.error)
            : "no result";
        super(`JSON RPC error: ${errorMessage}, ${payload.method}`);
        this.response = res;
        this.payload = payload;
    }
}
exports.ErrorJsonRpcResponse = ErrorJsonRpcResponse;
/** JSON RPC endpoint returned status code != 200 */
class HttpRpcError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.HttpRpcError = HttpRpcError;
/**
 * JSON RPC spec errors https://www.jsonrpc.org/specification#response_object
 */
function parseJsonRpcErrorCode(code) {
    if (code === -32700)
        return "Parse request error";
    if (code === -32600)
        return "Invalid request object";
    if (code === -32601)
        return "Method not found";
    if (code === -32602)
        return "Invalid params";
    if (code === -32603)
        return "Internal error";
    if (code <= -32000 && code >= -32099)
        return "Server error";
    return `Unknown error code ${code}`;
}
//# sourceMappingURL=jsonRpcHttpClient.js.map