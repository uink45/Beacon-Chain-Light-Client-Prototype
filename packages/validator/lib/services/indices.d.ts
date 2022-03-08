import { ValidatorIndex } from "@chainsafe/lodestar-types";
import { ILogger } from "@chainsafe/lodestar-utils";
import { Api } from "@chainsafe/lodestar-api";
import { ValidatorStore } from "./validatorStore";
export declare class IndicesService {
    private readonly logger;
    private readonly api;
    private readonly validatorStore;
    readonly index2pubkey: Map<number, string>;
    /** Indexed by pubkey in hex 0x prefixed */
    readonly pubkey2index: Map<string, number>;
    private pollValidatorIndicesPromise;
    constructor(logger: ILogger, api: Api, validatorStore: ValidatorStore);
    /** Return all known indices from the validatorStore pubkeys */
    getAllLocalIndices(): ValidatorIndex[];
    /** Return true if `index` is active part of this validator client */
    hasValidatorIndex(index: ValidatorIndex): boolean;
    pollValidatorIndices(): Promise<ValidatorIndex[]>;
    /** Iterate through all the voting pubkeys in the `ValidatorStore` and attempt to learn any unknown
        validator indices. Returns the new discovered indexes */
    private pollValidatorIndicesInternal;
    private fetchValidatorIndices;
}
//# sourceMappingURL=indices.d.ts.map