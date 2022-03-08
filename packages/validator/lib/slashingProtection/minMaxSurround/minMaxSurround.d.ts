import { BLSPubkey } from "@chainsafe/lodestar-types";
import { IMinMaxSurround, IDistanceStore, MinMaxSurroundAttestation } from "./interface";
export declare class MinMaxSurround implements IMinMaxSurround {
    private store;
    private maxEpochLookback;
    constructor(store: IDistanceStore, options?: {
        maxEpochLookback?: number;
    });
    assertNoSurround(pubKey: BLSPubkey, attestation: MinMaxSurroundAttestation): Promise<void>;
    insertAttestation(pubKey: BLSPubkey, attestation: MinMaxSurroundAttestation): Promise<void>;
    private updateMinSpan;
    private assertNotSurrounding;
    private updateMaxSpan;
    private assertNotSurrounded;
}
//# sourceMappingURL=minMaxSurround.d.ts.map