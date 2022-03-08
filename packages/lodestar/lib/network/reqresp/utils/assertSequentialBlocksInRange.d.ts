import { allForks, phase0 } from "@chainsafe/lodestar-types";
import { LodestarError } from "@chainsafe/lodestar-utils";
/**
 * Asserts a response from BeaconBlocksByRange respects the request and is sequential
 * Note: MUST allow missing block for skipped slots.
 */
export declare function assertSequentialBlocksInRange(blocks: allForks.SignedBeaconBlock[], { count, startSlot, step }: phase0.BeaconBlocksByRangeRequest): void;
export declare enum BlocksByRangeErrorCode {
    BAD_LENGTH = "BLOCKS_BY_RANGE_ERROR_BAD_LENGTH",
    UNDER_START_SLOT = "BLOCKS_BY_RANGE_ERROR_UNDER_START_SLOT",
    OVER_MAX_SLOT = "BLOCKS_BY_RANGE_ERROR_OVER_MAX_SLOT",
    BAD_SEQUENCE = "BLOCKS_BY_RANGE_ERROR_BAD_SEQUENCE"
}
declare type BlocksByRangeErrorType = {
    code: BlocksByRangeErrorCode.BAD_LENGTH;
    count: number;
    length: number;
} | {
    code: BlocksByRangeErrorCode.UNDER_START_SLOT;
    startSlot: number;
    firstSlot: number;
} | {
    code: BlocksByRangeErrorCode.OVER_MAX_SLOT;
    maxSlot: number;
    lastSlot: number;
} | {
    code: BlocksByRangeErrorCode.BAD_SEQUENCE;
    step: number;
    slotL: number;
    slotR: number;
};
export declare class BlocksByRangeError extends LodestarError<BlocksByRangeErrorType> {
}
export {};
//# sourceMappingURL=assertSequentialBlocksInRange.d.ts.map