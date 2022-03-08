import { BLSPubkey, Root } from "@chainsafe/lodestar-types";
import { DatabaseService, IDatabaseApiOptions } from "@chainsafe/lodestar-db";
import { ISlashingProtection } from "./interface";
import { Interchange, InterchangeFormatVersion } from "./interchange";
import { SlashingProtectionBlock, SlashingProtectionAttestation } from "./types";
export { InvalidAttestationError, InvalidAttestationErrorCode } from "./attestation";
export { InvalidBlockError, InvalidBlockErrorCode } from "./block";
export { InterchangeError, InterchangeErrorErrorCode, Interchange, InterchangeFormat } from "./interchange";
export { ISlashingProtection, InterchangeFormatVersion, SlashingProtectionBlock, SlashingProtectionAttestation };
/**
 * Handles slashing protection for validator proposer and attester duties as well as slashing protection
 * during a validator interchange import/export process.
 */
export declare class SlashingProtection extends DatabaseService implements ISlashingProtection {
    private blockService;
    private attestationService;
    constructor(opts: IDatabaseApiOptions);
    checkAndInsertBlockProposal(pubKey: BLSPubkey, block: SlashingProtectionBlock): Promise<void>;
    checkAndInsertAttestation(pubKey: BLSPubkey, attestation: SlashingProtectionAttestation): Promise<void>;
    importInterchange(interchange: Interchange, genesisValidatorsRoot: Root): Promise<void>;
    exportInterchange(genesisValidatorsRoot: Root, pubkeys: BLSPubkey[], formatVersion: InterchangeFormatVersion): Promise<Interchange>;
    listPubkeys(): Promise<BLSPubkey[]>;
}
//# sourceMappingURL=index.d.ts.map