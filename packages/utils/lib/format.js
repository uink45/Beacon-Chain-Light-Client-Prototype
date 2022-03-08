"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyBytes = void 0;
const bytes_1 = require("./bytes");
/**
 * Format bytes as `0x1234…1234`
 * 4 bytes can represent 4294967296 values, so the chance of collision is low
 */
function prettyBytes(root) {
    const str = typeof root === "string" ? root : (0, bytes_1.toHexString)(root);
    return `${str.slice(0, 6)}…${str.slice(-4)}`;
}
exports.prettyBytes = prettyBytes;
//# sourceMappingURL=format.js.map