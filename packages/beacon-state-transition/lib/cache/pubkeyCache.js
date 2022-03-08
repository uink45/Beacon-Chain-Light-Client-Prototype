"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncPubkeys = exports.PubkeyIndexMap = void 0;
const bls_1 = __importStar(require("@chainsafe/bls"));
/**
 * toHexString() creates hex strings via string concatenation, which are very memory inneficient.
 * Memory benchmarks show that Buffer.toString("hex") produces strings with 10x less memory.
 *
 * Does not prefix to save memory, thus the prefix is removed from an already string representation.
 *
 * See https://github.com/ChainSafe/lodestar/issues/3446
 */
function toMemoryEfficientHexStr(hex) {
    if (typeof hex === "string") {
        if (hex.startsWith("0x")) {
            hex = hex.slice(2);
        }
        return hex;
    }
    return Buffer.from(hex).toString("hex");
}
class PubkeyIndexMap {
    constructor() {
        // We don't really need the full pubkey. We could just use the first 20 bytes like an Ethereum address
        this.map = new Map();
    }
    get size() {
        return this.map.size;
    }
    /**
     * Must support reading with string for API support where pubkeys are already strings
     */
    get(key) {
        return this.map.get(toMemoryEfficientHexStr(key));
    }
    set(key, value) {
        this.map.set(toMemoryEfficientHexStr(key), value);
    }
}
exports.PubkeyIndexMap = PubkeyIndexMap;
/**
 * Checks the pubkey indices against a state and adds missing pubkeys
 *
 * Mutates `pubkey2index` and `index2pubkey`
 *
 * If pubkey caches are empty: SLOW CODE - 🐢
 */
function syncPubkeys(state, pubkey2index, index2pubkey) {
    if (pubkey2index.size !== index2pubkey.length) {
        throw new Error(`Pubkey indices have fallen out of sync: ${pubkey2index.size} != ${index2pubkey.length}`);
    }
    // Get the validators sub tree once for all the loop
    const validators = state.validators;
    const newCount = state.validators.length;
    for (let i = pubkey2index.size; i < newCount; i++) {
        const pubkey = validators[i].pubkey.valueOf();
        pubkey2index.set(pubkey, i);
        // Pubkeys must be checked for group + inf. This must be done only once when the validator deposit is processed.
        // Afterwards any public key is the state consider validated.
        // > Do not do any validation here
        index2pubkey.push(bls_1.default.PublicKey.fromBytes(pubkey, bls_1.CoordType.jacobian)); // Optimize for aggregation
    }
}
exports.syncPubkeys = syncPubkeys;
//# sourceMappingURL=pubkeyCache.js.map