"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqueVectorArr = exports.minEpoch = exports.numToString = exports.toOptionalHexString = exports.fromOptionalHexString = exports.isEqualNonZeroRoot = exports.isEqualRoot = exports.ZERO_ROOT = exports.blsPubkeyLen = void 0;
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const ssz_1 = require("@chainsafe/ssz");
exports.blsPubkeyLen = 48;
exports.ZERO_ROOT = lodestar_types_1.ssz.Root.defaultValue();
function isEqualRoot(root1, root2) {
    return lodestar_types_1.ssz.Root.equals(root1, root2);
}
exports.isEqualRoot = isEqualRoot;
function isEqualNonZeroRoot(root1, root2) {
    return !isEqualRoot(root1, exports.ZERO_ROOT) && isEqualRoot(root1, root2);
}
exports.isEqualNonZeroRoot = isEqualNonZeroRoot;
function fromOptionalHexString(hex) {
    return hex ? (0, ssz_1.fromHexString)(hex) : exports.ZERO_ROOT;
}
exports.fromOptionalHexString = fromOptionalHexString;
function toOptionalHexString(root) {
    return isEqualRoot(root, exports.ZERO_ROOT) ? undefined : (0, ssz_1.toHexString)(root);
}
exports.toOptionalHexString = toOptionalHexString;
/**
 * Typesafe wrapper around `String()`. The String constructor accepts any which is dangerous
 */
function numToString(num) {
    return String(num);
}
exports.numToString = numToString;
function minEpoch(epochs) {
    return epochs.length > 0 ? Math.min(...epochs) : null;
}
exports.minEpoch = minEpoch;
function uniqueVectorArr(buffers) {
    const bufferStr = new Set();
    return buffers.filter((buffer) => {
        const str = (0, ssz_1.toHexString)(buffer);
        const seen = bufferStr.has(str);
        bufferStr.add(str);
        return !seen;
    });
}
exports.uniqueVectorArr = uniqueVectorArr;
//# sourceMappingURL=utils.js.map