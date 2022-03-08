import { PublicKey } from "@chainsafe/bls";
import { Root } from "@chainsafe/lodestar-types";
export declare enum SignatureSetType {
    single = "single",
    aggregate = "aggregate"
}
export declare type ISignatureSet = {
    type: SignatureSetType.single;
    pubkey: PublicKey;
    signingRoot: Root;
    signature: Uint8Array;
} | {
    type: SignatureSetType.aggregate;
    pubkeys: PublicKey[];
    signingRoot: Root;
    signature: Uint8Array;
};
export declare function verifySignatureSet(signatureSet: ISignatureSet): boolean;
//# sourceMappingURL=signatureSets.d.ts.map