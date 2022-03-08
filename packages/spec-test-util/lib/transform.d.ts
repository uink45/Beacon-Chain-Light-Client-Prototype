import { Type } from "@chainsafe/ssz";
/**
 * Transform the type to something that is safe to deserialize
 *
 * This mainly entails making sure all numbers are bignumbers
 */
export declare function safeType(type: Type<any>): Type<any>;
//# sourceMappingURL=transform.d.ts.map