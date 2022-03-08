import { PublicKey } from "@chainsafe/bls";
export declare type SignatureSetDeserialized = {
    publicKey: PublicKey;
    message: Uint8Array;
    signature: Uint8Array;
};
/**
 * Verify signatures sets with batch verification or regular core verify depending on the set count.
 * Abstracted in a separate file to be consumed by the threaded pool and the main thread implementation.
 */
export declare function verifySignatureSetsMaybeBatch(sets: SignatureSetDeserialized[]): boolean;
//# sourceMappingURL=maybeBatch.d.ts.map