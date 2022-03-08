"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBLS = void 0;
const bls_1 = require("@chainsafe/bls");
async function initBLS() {
    try {
        await (0, bls_1.init)("blst-native");
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Performance warning: Using fallback wasm BLS implementation");
        await (0, bls_1.init)("herumi");
    }
}
exports.initBLS = initBLS;
//# sourceMappingURL=bls.js.map