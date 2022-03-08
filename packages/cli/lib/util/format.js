"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRange = exports.add0xPrefix = void 0;
/**
 * 0x prefix a string if not prefixed already
 */
function add0xPrefix(hex) {
    if (!hex.startsWith("0x")) {
        return `0x${hex}`;
    }
    else {
        return hex;
    }
}
exports.add0xPrefix = add0xPrefix;
/**
 * Parse string inclusive range: `0..32`, into an array of all values in that range
 */
function parseRange(range) {
    if (!range.includes("..")) {
        throw Error(`Invalid range '${range}', must include '..'`);
    }
    const [from, to] = range.split("..").map((n) => parseInt(n));
    if (isNaN(from))
        throw Error(`Invalid range from isNaN '${range}'`);
    if (isNaN(to))
        throw Error(`Invalid range to isNaN '${range}'`);
    if (from > to)
        throw Error(`Invalid range from > to '${range}'`);
    const arr = [];
    for (let i = from; i <= to; i++) {
        arr.push(i);
    }
    return arr;
}
exports.parseRange = parseRange;
//# sourceMappingURL=format.js.map