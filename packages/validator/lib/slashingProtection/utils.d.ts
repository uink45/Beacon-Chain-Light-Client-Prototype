import { Epoch, Root } from "@chainsafe/lodestar-types";
import { Vector } from "@chainsafe/ssz";
export declare const blsPubkeyLen = 48;
export declare const ZERO_ROOT: import("@chainsafe/ssz").ByteVector;
export declare function isEqualRoot(root1: Root, root2: Root): boolean;
export declare function isEqualNonZeroRoot(root1: Root, root2: Root): boolean;
export declare function fromOptionalHexString(hex: string | undefined): Root;
export declare function toOptionalHexString(root: Root): string | undefined;
/**
 * Typesafe wrapper around `String()`. The String constructor accepts any which is dangerous
 */
export declare function numToString(num: number): string;
export declare function minEpoch(epochs: Epoch[]): Epoch | null;
export declare function uniqueVectorArr(buffers: Vector<number>[]): Vector<number>[];
//# sourceMappingURL=utils.d.ts.map