import { phase0, Slot } from "@chainsafe/lodestar-types";
import { PublicKey } from "@chainsafe/bls";
import { CachedBeaconStateAllForks, ISignatureSet } from "@chainsafe/lodestar-beacon-state-transition";
export declare function getSelectionProofSignatureSet(state: CachedBeaconStateAllForks, slot: Slot, aggregator: PublicKey, aggregateAndProof: phase0.SignedAggregateAndProof): ISignatureSet;
//# sourceMappingURL=selectionProof.d.ts.map