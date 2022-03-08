import { Domain } from "@chainsafe/lodestar-types";
import { Type } from "@chainsafe/ssz";
/**
 * Return the signing root of an object by calculating the root of the object-domain tree.
 */
export declare function computeSigningRoot<T>(type: Type<T>, sszObject: T, domain: Domain): Uint8Array;
//# sourceMappingURL=signingRoot.d.ts.map