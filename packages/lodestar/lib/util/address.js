"use strict";
/**
 * @module util/address
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAddress = void 0;
function isValidAddress(address) {
    return !!address && address.startsWith("0x") && address.length === 42;
}
exports.isValidAddress = isValidAddress;
//# sourceMappingURL=address.js.map