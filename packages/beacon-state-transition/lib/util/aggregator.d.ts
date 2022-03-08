import { BLSSignature } from "@chainsafe/lodestar-types";
export declare function isSyncCommitteeAggregator(selectionProof: BLSSignature): boolean;
export declare function isAggregatorFromCommitteeLength(committeeLength: number, slotSignature: BLSSignature): boolean;
/**
 * Note: **must** use bytesToBigInt() otherwise a JS number is not able to represent the latest digits of
 * the remainder, resulting in `14333559117764833000` for example, where the last three digits are always zero.
 * Using bytesToInt() may cause isSelectionProofValid() to always return false.
 */
export declare function isSelectionProofValid(sig: BLSSignature, modulo: number): boolean;
//# sourceMappingURL=aggregator.d.ts.map