/// <reference types="node" />
import { ArrayLike } from "@chainsafe/ssz";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Db, Repository, IKeyValue, IFilterOptions, IDbMetrics } from "@chainsafe/lodestar-db";
import { Slot, Root, allForks } from "@chainsafe/lodestar-types";
export interface IBlockFilterOptions extends IFilterOptions<Slot> {
    step?: number;
}
export declare type BlockArchiveBatchPutBinaryItem = IKeyValue<Slot, Uint8Array> & {
    slot: Slot;
    blockRoot: Root;
    parentRoot: Root;
};
/**
 * Stores finalized blocks. Block slot is identifier.
 */
export declare class BlockArchiveRepository extends Repository<Slot, allForks.SignedBeaconBlock> {
    constructor(config: IChainForkConfig, db: Db, metrics?: IDbMetrics);
    encodeValue(value: allForks.SignedBeaconBlock): Uint8Array;
    decodeValue(data: Uint8Array): allForks.SignedBeaconBlock;
    getId(value: allForks.SignedBeaconBlock): Slot;
    decodeKey(data: Uint8Array): number;
    put(key: Slot, value: allForks.SignedBeaconBlock): Promise<void>;
    batchPut(items: ArrayLike<IKeyValue<Slot, allForks.SignedBeaconBlock>>): Promise<void>;
    batchPutBinary(items: ArrayLike<BlockArchiveBatchPutBinaryItem>): Promise<void>;
    remove(value: allForks.SignedBeaconBlock): Promise<void>;
    batchRemove(values: ArrayLike<allForks.SignedBeaconBlock>): Promise<void>;
    valuesStream(opts?: IBlockFilterOptions): AsyncIterable<allForks.SignedBeaconBlock>;
    values(opts?: IBlockFilterOptions): Promise<allForks.SignedBeaconBlock[]>;
    getByRoot(root: Root): Promise<allForks.SignedBeaconBlock | null>;
    getBinaryEntryByRoot(root: Root): Promise<IKeyValue<Slot, Buffer> | null>;
    getByParentRoot(root: Root): Promise<allForks.SignedBeaconBlock | null>;
    getSlotByRoot(root: Root): Promise<Slot | null>;
    getSlotByParentRoot(root: Root): Promise<Slot | null>;
    private parseSlot;
    private getFirstSlot;
}
//# sourceMappingURL=blockArchive.d.ts.map