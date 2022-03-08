import { BitList, BitVector, TreeBacked, Type } from "@chainsafe/ssz";
import { LodestarError } from "@chainsafe/lodestar-utils";
/**
 * Given a byte (0 -> 255), return a Array of boolean with length = 8, big endian.
 * Ex: 1 => [true false false false false false false false]
 *     5 => [true false true false false fase false false]
 */
export declare function getUint8ByteToBitBooleanArray(byte: number): boolean[];
/** zipIndexes for CommitteeBits. @see zipIndexes */
export declare function zipIndexesCommitteeBits(indexes: number[], bits: TreeBacked<BitVector> | BitVector): number[];
/** zipIndexes for SyncCommitteeBits. @see zipIndexes */
export declare function zipIndexesSyncCommitteeBits(indexes: number[], bits: TreeBacked<BitVector> | BitVector): number[];
/** Similar to zipIndexesSyncCommitteeBits but we extract both participant and unparticipant indices*/
export declare function zipAllIndexesSyncCommitteeBits(indexes: number[], bits: TreeBacked<BitVector> | BitVector): [number[], number[]];
/**
 * Performant indexing of a BitList, both as struct or TreeBacked
 * Return [0] as participant indices and [1] as unparticipant indices
 * @see zipIndexesInBitListTreeBacked
 */
export declare function zipIndexes<BitArr extends BitList | BitVector>(indexes: number[], bitlist: TreeBacked<BitArr> | BitArr, sszType: Type<BitArr>): [number[], number[]];
/**
 * Returns [0] as indices that participated in `bitlist` and [1] as indices that did not participated in `bitlist`.
 * Participation of `indexes[i]` means that the bit at position `i` in `bitlist` is true.
 *
 * Previously we computed this information with `readonlyValues(TreeBacked<BitList>)`.
 * However this approach is very inneficient since the SSZ parsing of BitList is not optimized.
 * This function uses a precomputed array of booleans `Uint8 -> boolean[]` @see uint8ByteToBitBooleanArrays.
 * This approach is x15 times faster.
 */
export declare function zipIndexesTreeBacked<BitArr extends BitList | BitVector>(indexes: number[], bits: TreeBacked<BitArr>, sszType: Type<BitArr>): [number[], number[]];
/**
 * Efficiently extract the Uint8Array inside a `TreeBacked<BitList>` structure.
 * @see zipIndexesInBitListTreeBacked for reasoning and advantatges.
 */
export declare function bitsToUint8Array<BitArr extends BitList | BitVector>(bits: TreeBacked<BitArr>, sszType: Type<BitArr>): Uint8Array;
/**
 * Variant to extract a single bit (for un-aggregated attestations)
 */
export declare function getSingleBitIndex(bits: BitList | TreeBacked<BitList>): number;
export declare enum AggregationBitsErrorCode {
    NOT_EXACTLY_ONE_BIT_SET = "AGGREGATION_BITS_ERROR_NOT_EXACTLY_ONE_BIT_SET"
}
declare type AggregationBitsErrorType = {
    code: AggregationBitsErrorCode.NOT_EXACTLY_ONE_BIT_SET;
};
export declare class AggregationBitsError extends LodestarError<AggregationBitsErrorType> {
}
export {};
//# sourceMappingURL=aggregationBits.d.ts.map