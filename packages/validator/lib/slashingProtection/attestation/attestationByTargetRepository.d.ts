import { BLSPubkey, Epoch } from "@chainsafe/lodestar-types";
import { Bucket, IDatabaseApiOptions } from "@chainsafe/lodestar-db";
import { Type } from "@chainsafe/ssz";
import { LodestarValidatorDatabaseController } from "../../types";
import { SlashingProtectionAttestation } from "../types";
/**
 * Manages validator db storage of attestations.
 * Entries in the db are indexed by an encoded key which combines the validator's public key and the
 * attestation's target epoch.
 */
export declare class AttestationByTargetRepository {
    protected type: Type<SlashingProtectionAttestation>;
    protected db: LodestarValidatorDatabaseController;
    protected bucket: Bucket;
    constructor(opts: IDatabaseApiOptions);
    getAll(pubkey: BLSPubkey, limit?: number): Promise<SlashingProtectionAttestation[]>;
    get(pubkey: BLSPubkey, targetEpoch: Epoch): Promise<SlashingProtectionAttestation | null>;
    set(pubkey: BLSPubkey, atts: SlashingProtectionAttestation[]): Promise<void>;
    listPubkeys(): Promise<BLSPubkey[]>;
    private encodeKey;
    private decodeKey;
}
//# sourceMappingURL=attestationByTargetRepository.d.ts.map