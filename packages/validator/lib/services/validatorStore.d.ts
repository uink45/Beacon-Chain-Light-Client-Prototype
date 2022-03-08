import { IBeaconConfig } from "@chainsafe/lodestar-config";
import { SecretKey } from "@chainsafe/bls";
import { allForks, altair, BLSPubkey, BLSSignature, Epoch, phase0, Root, Slot, ValidatorIndex } from "@chainsafe/lodestar-types";
import { routes } from "@chainsafe/lodestar-api";
import { ISlashingProtection } from "../slashingProtection";
import { PubkeyHex } from "../types";
export declare enum SignerType {
    Local = 0,
    Remote = 1
}
export declare type SignerLocal = {
    type: SignerType.Local;
    secretKey: SecretKey;
};
export declare type SignerRemote = {
    type: SignerType.Remote;
    externalSignerUrl: string;
    pubkeyHex: PubkeyHex;
};
/**
 * Validator entity capable of producing signatures. Either:
 * - local: With BLS secret key
 * - remote: With data to contact a remote signer
 */
export declare type Signer = SignerLocal | SignerRemote;
/**
 * Service that sets up and handles validator attester duties.
 */
export declare class ValidatorStore {
    private readonly config;
    private readonly slashingProtection;
    private readonly validators;
    private readonly genesisValidatorsRoot;
    constructor(config: IBeaconConfig, slashingProtection: ISlashingProtection, signers: Signer[], genesis: phase0.Genesis);
    /** Return true if there is at least 1 pubkey registered */
    hasSomeValidators(): boolean;
    votingPubkeys(): PubkeyHex[];
    hasVotingPubkey(pubkeyHex: PubkeyHex): boolean;
    signBlock(pubkey: BLSPubkey, block: allForks.BeaconBlock, currentSlot: Slot): Promise<allForks.SignedBeaconBlock>;
    signRandao(pubkey: BLSPubkey, slot: Slot): Promise<BLSSignature>;
    signAttestation(duty: routes.validator.AttesterDuty, attestationData: phase0.AttestationData, currentEpoch: Epoch): Promise<phase0.Attestation>;
    signAggregateAndProof(duty: routes.validator.AttesterDuty, selectionProof: BLSSignature, aggregate: phase0.Attestation): Promise<phase0.SignedAggregateAndProof>;
    signSyncCommitteeSignature(pubkey: BLSPubkey, validatorIndex: ValidatorIndex, slot: Slot, beaconBlockRoot: Root): Promise<altair.SyncCommitteeMessage>;
    signContributionAndProof(duty: Pick<routes.validator.SyncDuty, "pubkey" | "validatorIndex">, selectionProof: BLSSignature, contribution: altair.SyncCommitteeContribution): Promise<altair.SignedContributionAndProof>;
    signAttestationSelectionProof(pubkey: BLSPubkey, slot: Slot): Promise<BLSSignature>;
    signSyncCommitteeSelectionProof(pubkey: BLSPubkey | string, slot: Slot, subcommitteeIndex: number): Promise<BLSSignature>;
    signVoluntaryExit(pubkey: PubkeyHex, validatorIndex: number, exitEpoch: Epoch): Promise<phase0.SignedVoluntaryExit>;
    private getSignature;
    /** Prevent signing bad data sent by the Beacon node */
    private validateAttestationDuty;
}
//# sourceMappingURL=validatorStore.d.ts.map