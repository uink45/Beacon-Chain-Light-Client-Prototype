"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlJoin = exports.stringifyQuery = void 0;
const qs_1 = __importDefault(require("qs"));
/**
 * Eth2.0 API requires the query with format:
 * - arrayFormat: repeat `topic=topic1&topic=topic2`
 */
function stringifyQuery(query) {
    return qs_1.default.stringify(query, { arrayFormat: "repeat" });
}
exports.stringifyQuery = stringifyQuery;
/**
 * TODO: Optimize, two regex is a bit wasteful
 */
function urlJoin(...args) {
    return (args
        .join("/")
        .replace(/([^:]\/)\/+/g, "$1")
        // Remove duplicate slashes in the front
        .replace(/^(\/)+/, "/"));
}
exports.urlJoin = urlJoin;
//# sourceMappingURL=format.js.map