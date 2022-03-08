"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlsSingleThreadVerifier = void 0;
const maybeBatch_1 = require("./maybeBatch");
const utils_1 = require("./utils");
class BlsSingleThreadVerifier {
    constructor({ metrics = null }) {
        this.metrics = metrics;
    }
    async verifySignatureSets(sets) {
        var _a;
        const timer = (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.blsThreadPool.mainThreadDurationInThreadPool.startTimer();
        try {
            return (0, maybeBatch_1.verifySignatureSetsMaybeBatch)(sets.map((set) => ({
                publicKey: (0, utils_1.getAggregatedPubkey)(set),
                message: set.signingRoot.valueOf(),
                signature: set.signature,
            })));
        }
        finally {
            if (timer)
                timer();
        }
    }
}
exports.BlsSingleThreadVerifier = BlsSingleThreadVerifier;
//# sourceMappingURL=singleThread.js.map