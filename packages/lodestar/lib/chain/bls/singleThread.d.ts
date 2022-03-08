import { ISignatureSet } from "@chainsafe/lodestar-beacon-state-transition";
import { IMetrics } from "../../metrics";
import { IBlsVerifier } from "./interface";
export declare class BlsSingleThreadVerifier implements IBlsVerifier {
    private readonly metrics;
    constructor({ metrics }: {
        metrics: IMetrics | null;
    });
    verifySignatureSets(sets: ISignatureSet[]): Promise<boolean>;
}
//# sourceMappingURL=singleThread.d.ts.map