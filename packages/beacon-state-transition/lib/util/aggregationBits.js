"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregationBitsError = exports.AggregationBitsErrorCode = exports.getSingleBitIndex = exports.bitsToUint8Array = exports.zipIndexesTreeBacked = exports.zipIndexes = exports.zipAllIndexesSyncCommitteeBits = exports.zipIndexesSyncCommitteeBits = exports.zipIndexesCommitteeBits = exports.getUint8ByteToBitBooleanArray = void 0;
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const lodestar_utils_1 = require("@chainsafe/lodestar-utils");
const BITS_PER_BYTE = 8;
/** Globally cache this information. @see getUint8ByteToBitBooleanArray */
const uint8ByteToBitBooleanArrays = [];
/**
 * Given a byte (0 -> 255), return a Array of boolean with length = 8, big endian.
 * Ex: 1 => [true false false false false false false false]
 *     5 => [true false true false false fase false false]
 */
function getUint8ByteToBitBooleanArray(byte) {
    if (uint8ByteToBitBooleanArrays[byte] === undefined) {
        uint8ByteToBitBooleanArrays[byte] = computeUint8ByteToBitBooleanArray(byte);
    }
    return uint8ByteToBitBooleanArrays[byte];
}
exports.getUint8ByteToBitBooleanArray = getUint8ByteToBitBooleanArray;
/** @see getUint8ByteToBitBooleanArray */
function computeUint8ByteToBitBooleanArray(byte) {
    // this returns little endian
    const binaryStr = byte.toString(2);
    const binaryLength = binaryStr.length;
    return Array.from({ length: BITS_PER_BYTE }, (_, j) => {
        if (j < binaryLength) {
            return binaryStr[binaryLength - j - 1] === "1" ? true : false;
        }
        else {
            return false;
        }
    });
}
/** zipIndexes for CommitteeBits. @see zipIndexes */
function zipIndexesCommitteeBits(indexes, bits) {
    return zipIndexes(indexes, bits, lodestar_types_1.ssz.phase0.CommitteeBits)[0];
}
exports.zipIndexesCommitteeBits = zipIndexesCommitteeBits;
/** zipIndexes for SyncCommitteeBits. @see zipIndexes */
function zipIndexesSyncCommitteeBits(indexes, bits) {
    return zipIndexes(indexes, bits, lodestar_types_1.ssz.altair.SyncCommitteeBits)[0];
}
exports.zipIndexesSyncCommitteeBits = zipIndexesSyncCommitteeBits;
/** Similar to zipIndexesSyncCommitteeBits but we extract both participant and unparticipant indices*/
function zipAllIndexesSyncCommitteeBits(indexes, bits) {
    return zipIndexes(indexes, bits, lodestar_types_1.ssz.altair.SyncCommitteeBits);
}
exports.zipAllIndexesSyncCommitteeBits = zipAllIndexesSyncCommitteeBits;
/**
 * Performant indexing of a BitList, both as struct or TreeBacked
 * Return [0] as participant indices and [1] as unparticipant indices
 * @see zipIndexesInBitListTreeBacked
 */
function zipIndexes(indexes, bitlist, sszType) {
    if ((0, ssz_1.isTreeBacked)(bitlist)) {
        return zipIndexesTreeBacked(indexes, bitlist, sszType);
    }
    else {
        const attestingIndices = [];
        const unattestingIndices = [];
        for (let i = 0, len = indexes.length; i < len; i++) {
            if (bitlist[i]) {
                attestingIndices.push(indexes[i]);
            }
            else {
                unattestingIndices.push(indexes[i]);
            }
        }
        return [attestingIndices, unattestingIndices];
    }
}
exports.zipIndexes = zipIndexes;
/**
 * Returns [0] as indices that participated in `bitlist` and [1] as indices that did not participated in `bitlist`.
 * Participation of `indexes[i]` means that the bit at position `i` in `bitlist` is true.
 *
 * Previously we computed this information with `readonlyValues(TreeBacked<BitList>)`.
 * However this approach is very inneficient since the SSZ parsing of BitList is not optimized.
 * This function uses a precomputed array of booleans `Uint8 -> boolean[]` @see uint8ByteToBitBooleanArrays.
 * This approach is x15 times faster.
 */
function zipIndexesTreeBacked(indexes, bits, sszType) {
    const bytes = bitsToUint8Array(bits, sszType);
    const participantIndices = [];
    const unparticipantIndices = [];
    // Iterate over each byte of bits
    for (let iByte = 0, byteLen = bytes.length; iByte < byteLen; iByte++) {
        // Get the precomputed boolean array for this byte
        const booleansInByte = getUint8ByteToBitBooleanArray(bytes[iByte]);
        // For each bit in the byte check participation and add to indexesSelected array
        for (let iBit = 0; iBit < BITS_PER_BYTE; iBit++) {
            const committeeIndex = indexes[iByte * BITS_PER_BYTE + iBit];
            if (committeeIndex !== undefined) {
                if (booleansInByte[iBit]) {
                    participantIndices.push(committeeIndex);
                }
                else {
                    unparticipantIndices.push(committeeIndex);
                }
            }
        }
    }
    return [participantIndices, unparticipantIndices];
}
exports.zipIndexesTreeBacked = zipIndexesTreeBacked;
/**
 * Efficiently extract the Uint8Array inside a `TreeBacked<BitList>` structure.
 * @see zipIndexesInBitListTreeBacked for reasoning and advantatges.
 */
function bitsToUint8Array(bits, sszType) {
    const tree = bits.tree;
    const treeType = sszType;
    const chunkCount = treeType.tree_getChunkCount(tree);
    const chunkDepth = treeType.getChunkDepth();
    const nodeIterator = tree.iterateNodesAtDepth(chunkDepth, 0, chunkCount);
    const chunks = [];
    for (const node of nodeIterator) {
        chunks.push(node.root);
    }
    // the last chunk has 32 bytes but we don't use all of them
    return Buffer.concat(chunks).subarray(0, Math.ceil(bits.length / BITS_PER_BYTE));
}
exports.bitsToUint8Array = bitsToUint8Array;
/**
 * Variant to extract a single bit (for un-aggregated attestations)
 */
function getSingleBitIndex(bits) {
    let index = null;
    if ((0, ssz_1.isTreeBacked)(bits)) {
        const bytes = bitsToUint8Array(bits, lodestar_types_1.ssz.phase0.CommitteeBits);
        // Iterate over each byte of bits
        for (let iByte = 0, byteLen = bytes.length; iByte < byteLen; iByte++) {
            // If it's exactly zero, there won't be any indexes, continue early
            if (bytes[iByte] === 0) {
                continue;
            }
            // Get the precomputed boolean array for this byte
            const booleansInByte = getUint8ByteToBitBooleanArray(bytes[iByte]);
            // For each bit in the byte check participation and add to indexesSelected array
            for (let iBit = 0; iBit < BITS_PER_BYTE; iBit++) {
                if (booleansInByte[iBit] === true) {
                    if (index !== null)
                        throw new AggregationBitsError({ code: AggregationBitsErrorCode.NOT_EXACTLY_ONE_BIT_SET });
                    index = iByte * BITS_PER_BYTE + iBit;
                }
            }
        }
    }
    else {
        for (let i = 0, len = bits.length; i < len; i++) {
            if (bits[i] === true) {
                if (index !== null)
                    throw new AggregationBitsError({ code: AggregationBitsErrorCode.NOT_EXACTLY_ONE_BIT_SET });
                index = i;
            }
        }
    }
    if (index === null) {
        throw new AggregationBitsError({ code: AggregationBitsErrorCode.NOT_EXACTLY_ONE_BIT_SET });
    }
    else {
        return index;
    }
}
exports.getSingleBitIndex = getSingleBitIndex;
var AggregationBitsErrorCode;
(function (AggregationBitsErrorCode) {
    AggregationBitsErrorCode["NOT_EXACTLY_ONE_BIT_SET"] = "AGGREGATION_BITS_ERROR_NOT_EXACTLY_ONE_BIT_SET";
})(AggregationBitsErrorCode = exports.AggregationBitsErrorCode || (exports.AggregationBitsErrorCode = {}));
class AggregationBitsError extends lodestar_utils_1.LodestarError {
}
exports.AggregationBitsError = AggregationBitsError;
//# sourceMappingURL=aggregationBits.js.map