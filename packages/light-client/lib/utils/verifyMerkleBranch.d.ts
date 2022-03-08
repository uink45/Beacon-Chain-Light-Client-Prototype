export declare const SYNC_COMMITTEES_DEPTH = 4;
export declare const SYNC_COMMITTEES_INDEX = 11;
/**
 * Verify that the given ``leaf`` is on the merkle branch ``proof``
 * starting with the given ``root``.
 *
 * Browser friendly version of verifyMerkleBranch
 */
export declare function isValidMerkleBranch(leaf: Uint8Array, proof: Uint8Array[], depth: number, index: number, root: Uint8Array): boolean;
//# sourceMappingURL=verifyMerkleBranch.d.ts.map