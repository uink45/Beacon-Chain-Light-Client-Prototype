/// <reference types="node" />
import { TreeBacked } from "@chainsafe/ssz";
import { Epoch, Root, Slot, allForks } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Db, Repository, IDbMetrics } from "@chainsafe/lodestar-db";
export declare class StateArchiveRepository extends Repository<Slot, TreeBacked<allForks.BeaconState>> {
    constructor(config: IChainForkConfig, db: Db, metrics?: IDbMetrics);
    encodeValue(value: allForks.BeaconState): Buffer;
    decodeValue(data: Buffer): TreeBacked<allForks.BeaconState>;
    put(key: Slot, value: TreeBacked<allForks.BeaconState>): Promise<void>;
    getId(state: TreeBacked<allForks.BeaconState>): Epoch;
    decodeKey(data: Buffer): number;
    getByRoot(stateRoot: Root): Promise<TreeBacked<allForks.BeaconState> | null>;
    private getSlotByRoot;
}
//# sourceMappingURL=stateArchive.d.ts.map