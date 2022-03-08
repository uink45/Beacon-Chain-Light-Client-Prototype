/// <reference types="node" />
import { List, TreeBacked } from "@chainsafe/ssz";
import { Root } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Db, Repository, IKeyValue, IDbMetrics } from "@chainsafe/lodestar-db";
export declare class DepositDataRootRepository extends Repository<number, Root> {
    private depositRootTree?;
    constructor(config: IChainForkConfig, db: Db, metrics?: IDbMetrics);
    decodeKey(data: Buffer): number;
    getId(value: Root): number;
    put(id: number, value: Root): Promise<void>;
    batchPut(items: IKeyValue<number, Root>[]): Promise<void>;
    putList(list: List<Root>): Promise<void>;
    batchPutValues(values: {
        index: number;
        root: Root;
    }[]): Promise<void>;
    getTreeBacked(depositIndex: number): Promise<TreeBacked<List<Root>>>;
    getDepositRootTree(): Promise<TreeBacked<List<Root>>>;
}
//# sourceMappingURL=depositDataRoot.d.ts.map