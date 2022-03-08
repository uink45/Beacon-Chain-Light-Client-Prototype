import { BLSPubkey, Epoch } from "@chainsafe/lodestar-types";
import { Bucket, IDatabaseApiOptions } from "@chainsafe/lodestar-db";
import { Type } from "@chainsafe/ssz";
import { LodestarValidatorDatabaseController } from "../../types";
export interface SlashingProtectionLowerBound {
    minSourceEpoch: Epoch;
    minTargetEpoch: Epoch;
}
/**
 * Manages validator db storage of the minimum source and target epochs required of a validator
 * attestation.
 */
export declare class AttestationLowerBoundRepository {
    protected type: Type<SlashingProtectionLowerBound>;
    protected db: LodestarValidatorDatabaseController;
    protected bucket: Bucket;
    constructor(opts: IDatabaseApiOptions);
    get(pubkey: BLSPubkey): Promise<SlashingProtectionLowerBound | null>;
    set(pubkey: BLSPubkey, value: SlashingProtectionLowerBound): Promise<void>;
    private encodeKey;
}
//# sourceMappingURL=attestationLowerBoundRepository.d.ts.map