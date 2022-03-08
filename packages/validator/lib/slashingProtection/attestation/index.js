"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashingProtectionAttestationService = exports.InvalidAttestationErrorCode = exports.InvalidAttestationError = exports.AttestationLowerBoundRepository = exports.AttestationByTargetRepository = void 0;
const utils_1 = require("../utils");
const minMaxSurround_1 = require("../minMaxSurround");
const errors_1 = require("./errors");
Object.defineProperty(exports, "InvalidAttestationError", { enumerable: true, get: function () { return errors_1.InvalidAttestationError; } });
Object.defineProperty(exports, "InvalidAttestationErrorCode", { enumerable: true, get: function () { return errors_1.InvalidAttestationErrorCode; } });
const attestationByTargetRepository_1 = require("./attestationByTargetRepository");
Object.defineProperty(exports, "AttestationByTargetRepository", { enumerable: true, get: function () { return attestationByTargetRepository_1.AttestationByTargetRepository; } });
const attestationLowerBoundRepository_1 = require("./attestationLowerBoundRepository");
Object.defineProperty(exports, "AttestationLowerBoundRepository", { enumerable: true, get: function () { return attestationLowerBoundRepository_1.AttestationLowerBoundRepository; } });
var SafeStatus;
(function (SafeStatus) {
    SafeStatus["SAME_DATA"] = "SAFE_STATUS_SAME_DATA";
    SafeStatus["OK"] = "SAFE_STATUS_OK";
})(SafeStatus || (SafeStatus = {}));
class SlashingProtectionAttestationService {
    constructor(signedAttestationDb, attestationLowerBound, minMaxSurround) {
        this.attestationByTarget = signedAttestationDb;
        this.attestationLowerBound = attestationLowerBound;
        this.minMaxSurround = minMaxSurround;
    }
    /**
     * Check an attestation for slash safety, and if it is safe, record it in the database
     * This is the safe, externally-callable interface for checking attestations
     */
    async checkAndInsertAttestation(pubKey, attestation) {
        const safeStatus = await this.checkAttestation(pubKey, attestation);
        if (safeStatus != SafeStatus.SAME_DATA) {
            await this.insertAttestation(pubKey, attestation);
        }
        // TODO: Implement safe clean-up of stored attestations
    }
    /**
     * Check an attestation from `pubKey` for slash safety.
     */
    async checkAttestation(pubKey, attestation) {
        // Although it's not required to avoid slashing, we disallow attestations
        // which are obviously invalid by virtue of their source epoch exceeding their target.
        if (attestation.sourceEpoch > attestation.targetEpoch) {
            throw new errors_1.InvalidAttestationError({ code: errors_1.InvalidAttestationErrorCode.SOURCE_EXCEEDS_TARGET });
        }
        // Check for a double vote. Namely, an existing attestation with the same target epoch,
        // and a different signing root.
        const sameTargetAtt = await this.attestationByTarget.get(pubKey, attestation.targetEpoch);
        if (sameTargetAtt) {
            // Interchange format allows for attestations without signing_root, then assume root is equal
            if ((0, utils_1.isEqualNonZeroRoot)(sameTargetAtt.signingRoot, attestation.signingRoot)) {
                return SafeStatus.SAME_DATA;
            }
            else {
                throw new errors_1.InvalidAttestationError({
                    code: errors_1.InvalidAttestationErrorCode.DOUBLE_VOTE,
                    attestation: attestation,
                    prev: sameTargetAtt,
                });
            }
        }
        // Check for a surround vote
        try {
            await this.minMaxSurround.assertNoSurround(pubKey, attestation);
        }
        catch (e) {
            if (e instanceof minMaxSurround_1.SurroundAttestationError) {
                const prev = await this.attestationByTarget.get(pubKey, e.type.attestation2Target).catch(() => null);
                switch (e.type.code) {
                    case minMaxSurround_1.SurroundAttestationErrorCode.IS_SURROUNDING:
                        throw new errors_1.InvalidAttestationError({
                            code: errors_1.InvalidAttestationErrorCode.NEW_SURROUNDS_PREV,
                            attestation,
                            prev,
                        });
                    case minMaxSurround_1.SurroundAttestationErrorCode.IS_SURROUNDED:
                        throw new errors_1.InvalidAttestationError({
                            code: errors_1.InvalidAttestationErrorCode.PREV_SURROUNDS_NEW,
                            attestation,
                            prev,
                        });
                }
            }
            throw e;
        }
        // Refuse to sign any attestation with:
        // - source.epoch < min(att.source_epoch for att in data.signed_attestations if att.pubkey == attester_pubkey), OR
        // - target_epoch <= min(att.target_epoch for att in data.signed_attestations if att.pubkey == attester_pubkey)
        // (spec v4, Slashing Protection Database Interchange Format)
        const attestationLowerBound = await this.attestationLowerBound.get(pubKey);
        if (attestationLowerBound) {
            const { minSourceEpoch, minTargetEpoch } = attestationLowerBound;
            if (attestation.sourceEpoch < minSourceEpoch) {
                throw new errors_1.InvalidAttestationError({
                    code: errors_1.InvalidAttestationErrorCode.SOURCE_LESS_THAN_LOWER_BOUND,
                    sourceEpoch: attestation.sourceEpoch,
                    minSourceEpoch,
                });
            }
            if (attestation.targetEpoch <= minTargetEpoch) {
                throw new errors_1.InvalidAttestationError({
                    code: errors_1.InvalidAttestationErrorCode.TARGET_LESS_THAN_OR_EQ_LOWER_BOUND,
                    targetEpoch: attestation.targetEpoch,
                    minTargetEpoch,
                });
            }
        }
        return SafeStatus.OK;
    }
    /**
     * Insert an attestation into the slashing database
     * This should *only* be called in the same (exclusive) transaction as `checkAttestation`
     * so that the check isn't invalidated by a concurrent mutation
     */
    async insertAttestation(pubKey, attestation) {
        await this.attestationByTarget.set(pubKey, [attestation]);
        await this.minMaxSurround.insertAttestation(pubKey, attestation);
    }
    /**
     * Interchange import / export functionality
     */
    async importAttestations(pubkey, attestations) {
        await this.attestationByTarget.set(pubkey, attestations);
        // Pre-compute spans for all attestations
        for (const attestation of attestations) {
            await this.minMaxSurround.insertAttestation(pubkey, attestation);
        }
        // Pre-compute and store lower-bound
        const minSourceEpoch = (0, utils_1.minEpoch)(attestations.map((attestation) => attestation.sourceEpoch));
        const minTargetEpoch = (0, utils_1.minEpoch)(attestations.map((attestation) => attestation.targetEpoch));
        if (minSourceEpoch != null && minTargetEpoch != null) {
            await this.attestationLowerBound.set(pubkey, { minSourceEpoch, minTargetEpoch });
        }
    }
    /**
     * Interchange import / export functionality
     */
    async exportAttestations(pubkey) {
        return await this.attestationByTarget.getAll(pubkey);
    }
    async listPubkeys() {
        return await this.attestationByTarget.listPubkeys();
    }
}
exports.SlashingProtectionAttestationService = SlashingProtectionAttestationService;
//# sourceMappingURL=index.js.map