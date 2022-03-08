"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRandao = void 0;
const buffer_xor_1 = __importDefault(require("buffer-xor"));
const ssz_1 = require("@chainsafe/ssz");
const util_1 = require("../../util");
const signatureSets_1 = require("../signatureSets");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
/**
 * Commit a randao reveal to generate pseudorandomness seeds
 *
 * PERF: Fixed work independent of block contents.
 */
function processRandao(state, block, verifySignature = true) {
    const { epochCtx } = state;
    const epoch = epochCtx.currentShuffling.epoch;
    const randaoReveal = block.body.randaoReveal.valueOf();
    // verify RANDAO reveal
    if (verifySignature) {
        if (!(0, signatureSets_1.verifyRandaoSignature)(state, block)) {
            throw new Error("RANDAO reveal is an invalid signature");
        }
    }
    // mix in RANDAO reveal
    state.randaoMixes[epoch % lodestar_params_1.EPOCHS_PER_HISTORICAL_VECTOR] = (0, buffer_xor_1.default)(Buffer.from((0, util_1.getRandaoMix)(state, epoch)), Buffer.from((0, ssz_1.hash)(randaoReveal)));
}
exports.processRandao = processRandao;
//# sourceMappingURL=processRandao.js.map