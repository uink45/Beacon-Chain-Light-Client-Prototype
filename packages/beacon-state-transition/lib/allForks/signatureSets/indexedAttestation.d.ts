import { allForks, phase0 } from "@chainsafe/lodestar-types";
import { ISignatureSet } from "../../util";
import { CachedBeaconStateAllForks } from "../../types";
export declare function verifyIndexedAttestationSignature(state: CachedBeaconStateAllForks, indexedAttestation: phase0.IndexedAttestation, indices?: number[]): boolean;
export declare function getAttestationWithIndicesSignatureSet(state: CachedBeaconStateAllForks, attestation: Pick<phase0.Attestation, "data" | "signature">, indices: number[]): ISignatureSet;
export declare function getIndexedAttestationSignatureSet(state: CachedBeaconStateAllForks, indexedAttestation: phase0.IndexedAttestation, indices?: number[]): ISignatureSet;
export declare function getAttestationsSignatureSets(state: CachedBeaconStateAllForks, signedBlock: allForks.SignedBeaconBlock): ISignatureSet[];
//# sourceMappingURL=indexedAttestation.d.ts.map