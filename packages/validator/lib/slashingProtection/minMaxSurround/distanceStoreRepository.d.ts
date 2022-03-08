import { Bucket, IDatabaseApiOptions } from "@chainsafe/lodestar-db";
import { BLSPubkey, Epoch } from "@chainsafe/lodestar-types";
import { Type } from "@chainsafe/ssz";
import { LodestarValidatorDatabaseController } from "../../types";
import { IDistanceEntry, IDistanceStore } from "./interface";
/**
 * Manages validator db storage of min/max ranges for min/max surround vote slashing protection.
 */
export declare class DistanceStoreRepository implements IDistanceStore {
    minSpan: SpanDistanceRepository;
    maxSpan: SpanDistanceRepository;
    constructor(opts: IDatabaseApiOptions);
}
declare class SpanDistanceRepository {
    protected type: Type<Epoch>;
    protected db: LodestarValidatorDatabaseController;
    protected bucket: Bucket;
    constructor(opts: IDatabaseApiOptions, bucket: Bucket);
    get(pubkey: BLSPubkey, epoch: Epoch): Promise<Epoch | null>;
    setBatch(pubkey: BLSPubkey, values: IDistanceEntry[]): Promise<void>;
    private encodeKey;
}
export {};
//# sourceMappingURL=distanceStoreRepository.d.ts.map