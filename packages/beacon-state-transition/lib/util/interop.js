"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interopSecretKey = exports.interopSecretKeys = void 0;
const bigint_buffer_1 = require("bigint-buffer");
const ssz_1 = require("@chainsafe/ssz");
const bls_1 = __importDefault(require("@chainsafe/bls"));
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
let curveOrder;
function getCurveOrder() {
    if (!curveOrder)
        curveOrder = BigInt("52435875175126190479447740508185965837690552500527637822603658699938581184513");
    return curveOrder;
}
function interopSecretKeys(validatorCount) {
    return Array.from({ length: validatorCount }, (_, i) => {
        return interopSecretKey(i);
    });
}
exports.interopSecretKeys = interopSecretKeys;
function interopSecretKey(index) {
    const CURVE_ORDER = getCurveOrder();
    const secretKeyBytes = (0, bigint_buffer_1.toBufferBE)((0, lodestar_utils_1.bytesToBigInt)((0, ssz_1.hash)((0, lodestar_utils_1.intToBytes)(index, 32))) % CURVE_ORDER, 32);
    return bls_1.default.SecretKey.fromBytes(secretKeyBytes);
}
exports.interopSecretKey = interopSecretKey;
//# sourceMappingURL=interop.js.map