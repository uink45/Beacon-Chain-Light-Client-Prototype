import { ValidatorIndex } from "@chainsafe/lodestar-types";
import { phase0 } from "@chainsafe/lodestar-beacon-state-transition";
import { IBeaconChain } from "..";
export declare function validateGossipAggregateAndProof(chain: IBeaconChain, signedAggregateAndProof: phase0.SignedAggregateAndProof): Promise<{
    indexedAttestation: phase0.IndexedAttestation;
    committeeIndices: ValidatorIndex[];
}>;
//# sourceMappingURL=aggregateAndProof.d.ts.map