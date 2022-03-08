import { Epoch, ValidatorIndex } from "@chainsafe/lodestar-types";
/**
 * Keeps a cache to filter unaggregated attestations from the same validator in the same epoch.
 */
export declare class SeenAttesters {
    private readonly validatorIndexesByEpoch;
    private lowestPermissibleEpoch;
    isKnown(targetEpoch: Epoch, validatorIndex: ValidatorIndex): boolean;
    add(targetEpoch: Epoch, validatorIndex: ValidatorIndex): void;
    prune(currentEpoch: Epoch): void;
}
/**
 * Keeps a cache to filter aggregated attestations from the same aggregators in the same epoch
 */
export declare class SeenAggregators extends SeenAttesters {
}
//# sourceMappingURL=seenAttesters.d.ts.map