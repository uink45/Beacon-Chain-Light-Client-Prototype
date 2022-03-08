import { Node } from "@chainsafe/persistent-merkle-tree";
/**
 * Convert a Uint8Array to a merkle tree, using the underlying array's underlying ArrayBuffer
 *
 * `data` MUST NOT be modified after this, or risk the merkle nodes being modified.
 */
export declare function unsafeUint8ArrayToTree(data: Uint8Array, depth: number): Node;
//# sourceMappingURL=unsafeUint8ArrayToTree.d.ts.map