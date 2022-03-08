"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyHeader = exports.serializeSyncCommittee = exports.deserializeSyncCommittee = exports.toBlockHeader = exports.getParticipantPubkeys = exports.assertZeroHashes = exports.isZeroHash = exports.sumBits = void 0;
const bls_1 = require("@chainsafe/bls");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
function sumBits(bits) {
    let sum = 0;
    for (const bit of bits) {
        if (bit) {
            sum++;
        }
    }
    return sum;
}
exports.sumBits = sumBits;
function isZeroHash(root) {
    for (let i = 0; i < root.length; i++) {
        if (root[i] !== 0) {
            return false;
        }
    }
    return true;
}
exports.isZeroHash = isZeroHash;
function assertZeroHashes(rootArray, expectedLength, errorMessage) {
    if (rootArray.length !== expectedLength) {
        throw Error(`Wrong length ${errorMessage}`);
    }
    for (const root of rootArray) {
        if (!isZeroHash(root)) {
            throw Error(`Not zeroed ${errorMessage}`);
        }
    }
}
exports.assertZeroHashes = assertZeroHashes;
/**
 * Util to guarantee that all bits have a corresponding pubkey
 */
function getParticipantPubkeys(pubkeys, bits) {
    const participantPubkeys = [];
    for (let i = 0; i < bits.length; i++) {
        if (bits[i]) {
            if (pubkeys[i] === undefined)
                throw Error(`No pubkey ${i} in syncCommittee`);
            participantPubkeys.push(pubkeys[i]);
        }
    }
    return participantPubkeys;
}
exports.getParticipantPubkeys = getParticipantPubkeys;
function toBlockHeader(block) {
    return {
        slot: block.slot,
        proposerIndex: block.proposerIndex,
        parentRoot: block.parentRoot,
        stateRoot: block.stateRoot,
        bodyRoot: lodestar_types_1.ssz.altair.BeaconBlockBody.hashTreeRoot(block.body),
    };
}
exports.toBlockHeader = toBlockHeader;
function deserializePubkeys(pubkeys) {
    return Array.from(pubkeys).map((pk) => bls_1.PublicKey.fromBytes(pk.valueOf()));
}
function serializePubkeys(pubkeys) {
    return pubkeys.map((pk) => pk.toBytes());
}
function deserializeSyncCommittee(syncCommittee) {
    return {
        pubkeys: deserializePubkeys(syncCommittee.pubkeys),
        aggregatePubkey: bls_1.PublicKey.fromBytes(syncCommittee.aggregatePubkey.valueOf()),
    };
}
exports.deserializeSyncCommittee = deserializeSyncCommittee;
function serializeSyncCommittee(syncCommittee) {
    return {
        pubkeys: serializePubkeys(syncCommittee.pubkeys),
        aggregatePubkey: syncCommittee.aggregatePubkey.toBytes(),
    };
}
exports.serializeSyncCommittee = serializeSyncCommittee;
function isEmptyHeader(header) {
    const emptyValue = lodestar_types_1.ssz.phase0.BeaconBlockHeader.defaultValue();
    return lodestar_types_1.ssz.phase0.BeaconBlockHeader.equals(emptyValue, header);
}
exports.isEmptyHeader = isEmptyHeader;
//# sourceMappingURL=utils.js.map