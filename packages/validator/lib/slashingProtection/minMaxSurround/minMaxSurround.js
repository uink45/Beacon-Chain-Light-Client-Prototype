"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinMaxSurround = void 0;
const errors_1 = require("./errors");
// surround vote checking with min-max surround
// https://github.com/protolambda/eth2-surround#min-max-surround
class MinMaxSurround {
    constructor(store, options) {
        var _a;
        this.store = store;
        this.maxEpochLookback = (_a = options === null || options === void 0 ? void 0 : options.maxEpochLookback) !== null && _a !== void 0 ? _a : Infinity;
    }
    async assertNoSurround(pubKey, attestation) {
        await this.assertNotSurrounding(pubKey, attestation);
        await this.assertNotSurrounded(pubKey, attestation);
    }
    async insertAttestation(pubKey, attestation) {
        await this.updateMinSpan(pubKey, attestation);
        await this.updateMaxSpan(pubKey, attestation);
    }
    // min span
    async updateMinSpan(pubKey, attestation) {
        await this.assertNotSurrounding(pubKey, attestation);
        const untilEpoch = Math.max(0, attestation.sourceEpoch - 1 - this.maxEpochLookback);
        const values = [];
        for (let epoch = attestation.sourceEpoch - 1; epoch >= untilEpoch; epoch--) {
            const minSpan = await this.store.minSpan.get(pubKey, epoch);
            const distance = attestation.targetEpoch - epoch;
            if (minSpan === null || distance < minSpan) {
                values.push({ source: epoch, distance });
            }
            else {
                break;
            }
        }
        await this.store.minSpan.setBatch(pubKey, values);
    }
    async assertNotSurrounding(pubKey, attestation) {
        const minSpan = await this.store.minSpan.get(pubKey, attestation.sourceEpoch);
        const distance = attestation.targetEpoch - attestation.sourceEpoch;
        if (minSpan != null && minSpan > 0 && minSpan < distance) {
            throw new errors_1.SurroundAttestationError({
                code: errors_1.SurroundAttestationErrorCode.IS_SURROUNDING,
                attestation,
                attestation2Target: attestation.sourceEpoch + minSpan,
            });
        }
    }
    // max span
    async updateMaxSpan(pubKey, attestation) {
        await this.assertNotSurrounded(pubKey, attestation);
        const values = [];
        for (let epoch = attestation.sourceEpoch + 1; epoch < attestation.targetEpoch; epoch++) {
            const maxSpan = await this.store.maxSpan.get(pubKey, epoch);
            const distance = attestation.targetEpoch - epoch;
            if (maxSpan === null || distance > maxSpan) {
                values.push({ source: epoch, distance });
            }
            else {
                break;
            }
        }
        await this.store.maxSpan.setBatch(pubKey, values);
    }
    async assertNotSurrounded(pubKey, attestation) {
        const maxSpan = await this.store.maxSpan.get(pubKey, attestation.sourceEpoch);
        const distance = attestation.targetEpoch - attestation.sourceEpoch;
        if (maxSpan != null && maxSpan > 0 && maxSpan > distance) {
            throw new errors_1.SurroundAttestationError({
                code: errors_1.SurroundAttestationErrorCode.IS_SURROUNDED,
                attestation: attestation,
                attestation2Target: attestation.sourceEpoch + maxSpan,
            });
        }
    }
}
exports.MinMaxSurround = MinMaxSurround;
//# sourceMappingURL=minMaxSurround.js.map