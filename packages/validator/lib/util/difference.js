"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.differenceHex = void 0;
const ssz_1 = require("@chainsafe/ssz");
/**
 * Return items included in `next` but not in `prev`
 */
function differenceHex(prev, next) {
    const existing = new Set(prev.map((item) => (0, ssz_1.toHexString)(item)));
    return next.filter((item) => !existing.has((0, ssz_1.toHexString)(item)));
}
exports.differenceHex = differenceHex;
//# sourceMappingURL=difference.js.map