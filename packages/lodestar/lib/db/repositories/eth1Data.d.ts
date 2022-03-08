/// <reference types="node" />
import { phase0 } from "@chainsafe/lodestar-types";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Db, Repository, IDbMetrics } from "@chainsafe/lodestar-db";
export declare class Eth1DataRepository extends Repository<number, phase0.Eth1DataOrdered> {
    constructor(config: IChainForkConfig, db: Db, metrics?: IDbMetrics);
    decodeKey(data: Buffer): number;
    getId(value: phase0.Eth1Data): number;
    batchPutValues(eth1Datas: (phase0.Eth1DataOrdered & {
        timestamp: number;
    })[]): Promise<void>;
    deleteOld(timestamp: number): Promise<void>;
}
//# sourceMappingURL=eth1Data.d.ts.map