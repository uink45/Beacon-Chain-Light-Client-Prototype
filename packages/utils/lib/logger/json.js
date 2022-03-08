"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCtxToString = exports.logCtxToJson = void 0;
const bytes_1 = require("../bytes");
const errors_1 = require("../errors");
const objects_1 = require("../objects");
const MAX_DEPTH = 0;
/**
 * Renders any log Context to JSON up to one level of depth.
 *
 * By limiting recursiveness, it renders limited content while ensuring safer logging.
 * Consumers of the logger should ensure to send pre-formated data if they require nesting.
 */
function logCtxToJson(arg, depth = 0, fromError = false) {
    switch (typeof arg) {
        case "bigint":
        case "symbol":
        case "function":
            return arg.toString();
        case "object":
            if (arg === null)
                return "null";
            if (arg instanceof Uint8Array) {
                return (0, bytes_1.toHexString)(arg);
            }
            // For any type that may include recursiveness break early at the first level
            // - Prevent recursive loops
            // - Ensures Error with deep complex metadata won't leak into the logs and cause bugs
            if (depth > MAX_DEPTH) {
                return "[object]";
            }
            if (arg instanceof Error) {
                let metadata;
                if (arg instanceof errors_1.LodestarError) {
                    if (fromError) {
                        return "[LodestarErrorCircular]";
                    }
                    else {
                        // Allow one extra depth level for LodestarError
                        metadata = logCtxToJson(arg.getMetadata(), depth - 1, true);
                    }
                }
                else {
                    metadata = { message: arg.message };
                }
                if (arg.stack)
                    metadata.stack = arg.stack;
                return metadata;
            }
            if (Array.isArray(arg)) {
                return arg.map((item) => logCtxToJson(item, depth + 1));
            }
            return (0, objects_1.mapValues)(arg, (item) => logCtxToJson(item, depth + 1));
        // Already valid JSON
        case "number":
        case "string":
        case "undefined":
        case "boolean":
            return arg;
        default:
            return String(arg);
    }
}
exports.logCtxToJson = logCtxToJson;
/**
 * Renders any log Context to a string up to one level of depth.
 *
 * By limiting recursiveness, it renders limited content while ensuring safer logging.
 * Consumers of the logger should ensure to send pre-formated data if they require nesting.
 */
function logCtxToString(arg, depth = 0, fromError = false) {
    switch (typeof arg) {
        case "bigint":
        case "symbol":
        case "function":
            return arg.toString();
        case "object":
            if (arg === null)
                return "null";
            if (arg instanceof Uint8Array) {
                return (0, bytes_1.toHexString)(arg);
            }
            // For any type that may include recursiveness break early at the first level
            // - Prevent recursive loops
            // - Ensures Error with deep complex metadata won't leak into the logs and cause bugs
            if (depth > MAX_DEPTH) {
                return "[object]";
            }
            if (arg instanceof Error) {
                let metadata;
                if (arg instanceof errors_1.LodestarError) {
                    if (fromError) {
                        return "[LodestarErrorCircular]";
                    }
                    else {
                        // Allow one extra depth level for LodestarError
                        metadata = logCtxToString(arg.getMetadata(), depth - 1, true);
                    }
                }
                else {
                    metadata = arg.message;
                }
                return `${metadata}\n${arg.stack || ""}`;
            }
            if (Array.isArray(arg)) {
                return arg.map((item) => logCtxToString(item, depth + 1)).join(", ");
            }
            return Object.entries(arg)
                .map(([key, value]) => `${key}=${logCtxToString(value, depth + 1)}`)
                .join(", ");
        case "number":
        case "string":
        case "undefined":
        case "boolean":
        default:
            return String(arg);
    }
}
exports.logCtxToString = logCtxToString;
//# sourceMappingURL=json.js.map