export declare function hash(...inputs: Uint8Array[]): Uint8Array;
/**
 * Verify that the given ``leaf`` is on the merkle branch ``proof``
 * starting with the given ``root``.
 */
export declare function verifyMerkleBranch(leaf: Uint8Array, proof: Uint8Array[], depth: number, index: number, root: Uint8Array): boolean;
//# sourceMappingURL=verifyMerkleBranch.d.ts.map