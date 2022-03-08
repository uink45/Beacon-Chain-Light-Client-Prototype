"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlJoin = void 0;
/**
 * Joins multiple url parts safely
 * - Does not break the protocol double slash //
 * - Cleans double slashes at any point
 * @param args ("http://localhost/", "/node/", "/genesis_time")
 * @return "http://localhost/node/genesis_time"
 */
function urlJoin(...args) {
    return (args
        .join("/")
        .replace(/([^:]\/)\/+/g, "$1")
        // Remove duplicate slashes in the front
        .replace(/^(\/)+/, "/"));
}
exports.urlJoin = urlJoin;
//# sourceMappingURL=url.js.map