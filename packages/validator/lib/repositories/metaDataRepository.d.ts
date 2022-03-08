import { Bucket, IDatabaseApiOptions } from "@chainsafe/lodestar-db";
import { Root, Uint64 } from "@chainsafe/lodestar-types";
import { LodestarValidatorDatabaseController } from "../types";
/**
 * Store MetaData of validator.
 */
export declare class MetaDataRepository {
    protected db: LodestarValidatorDatabaseController;
    protected bucket: Bucket;
    constructor(opts: IDatabaseApiOptions);
    getGenesisValidatorsRoot(): Promise<Root | null>;
    setGenesisValidatorsRoot(genesisValidatorsRoot: Root): Promise<void>;
    getGenesisTime(): Promise<Uint64 | null>;
    setGenesisTime(genesisTime: Uint64): Promise<void>;
    private encodeKey;
}
//# sourceMappingURL=metaDataRepository.d.ts.map