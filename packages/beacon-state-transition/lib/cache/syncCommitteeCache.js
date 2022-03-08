"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSyncComitteeMap = exports.computeSyncCommitteeCache = exports.getSyncCommitteeCache = exports.SyncCommitteeCacheEmpty = void 0;
const ssz_1 = require("@chainsafe/ssz");
/** Placeholder object for pre-altair fork */
class SyncCommitteeCacheEmpty {
    get validatorIndices() {
        throw Error("Empty SyncCommitteeCache");
    }
    get validatorIndexMap() {
        throw Error("Empty SyncCommitteeCache");
    }
}
exports.SyncCommitteeCacheEmpty = SyncCommitteeCacheEmpty;
function getSyncCommitteeCache(validatorIndices) {
    return {
        validatorIndices,
        validatorIndexMap: computeSyncComitteeMap(validatorIndices),
    };
}
exports.getSyncCommitteeCache = getSyncCommitteeCache;
function computeSyncCommitteeCache(syncCommittee, pubkey2index) {
    const validatorIndices = computeSyncCommitteeIndices(syncCommittee, pubkey2index);
    const validatorIndexMap = computeSyncComitteeMap(validatorIndices);
    return {
        validatorIndices,
        validatorIndexMap,
    };
}
exports.computeSyncCommitteeCache = computeSyncCommitteeCache;
/**
 * Compute all index in sync committee for all validatorIndexes in `syncCommitteeIndexes`.
 * Helps reduce work necessary to verify a validatorIndex belongs in a sync committee and which.
 * This is similar to compute_subnets_for_sync_committee in https://github.com/ethereum/eth2.0-specs/blob/v1.1.0-alpha.5/specs/altair/validator.md
 */
function computeSyncComitteeMap(syncCommitteeIndexes) {
    const map = new Map();
    for (let i = 0, len = syncCommitteeIndexes.length; i < len; i++) {
        const validatorIndex = syncCommitteeIndexes[i];
        let indexes = map.get(validatorIndex);
        if (!indexes) {
            indexes = [];
            map.set(validatorIndex, indexes);
        }
        if (!indexes.includes(i)) {
            indexes.push(i);
        }
    }
    return map;
}
exports.computeSyncComitteeMap = computeSyncComitteeMap;
/**
 * Extract validator indices from current and next sync committee
 */
function computeSyncCommitteeIndices(syncCommittee, pubkey2index) {
    const validatorIndices = [];
    const pubkeys = (0, ssz_1.readonlyValues)(syncCommittee.pubkeys);
    for (const pubkey of pubkeys) {
        const validatorIndex = pubkey2index.get(pubkey.valueOf());
        if (validatorIndex === undefined) {
            throw Error(`SyncCommittee pubkey is unknown ${(0, ssz_1.toHexString)(pubkey)}`);
        }
        validatorIndices.push(validatorIndex);
    }
    return validatorIndices;
}
//# sourceMappingURL=syncCommitteeCache.js.map