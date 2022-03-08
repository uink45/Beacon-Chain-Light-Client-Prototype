/// <reference types="node" />
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Slot } from "@chainsafe/lodestar-types";
import { IDatabaseController, IDbMetrics, Repository } from "@chainsafe/lodestar-db";
/**
 * Slot to slot ranges that ensure that block range is fully backfilled
 *
 * If node starts backfilling at slots 1000, and backfills to 800, there will be an entry
 * 1000 -> 800
 *
 * When the node is backfilling if it starts at 1200 and backfills to 1000, it will find this sequence and,
 * jump directly to 800 and delete the key 1000.
 */
export declare class BackfilledRanges extends Repository<Slot, Slot> {
    constructor(config: IChainForkConfig, db: IDatabaseController<Uint8Array, Uint8Array>, metrics?: IDbMetrics);
    decodeKey(data: Buffer): number;
    getId(value: Slot): number;
}
//# sourceMappingURL=backfilledRanges.d.ts.map