import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { phase0 } from "@chainsafe/lodestar-types";
import { IBeaconDb } from "../db";
export declare class Eth1DataCache {
    db: IBeaconDb;
    config: IChainForkConfig;
    constructor(config: IChainForkConfig, db: IBeaconDb);
    get({ timestampRange }: {
        timestampRange: {
            gte: number;
            lte: number;
        };
    }): Promise<phase0.Eth1DataOrdered[]>;
    add(eth1Datas: (phase0.Eth1DataOrdered & {
        timestamp: number;
    })[]): Promise<void>;
    getHighestCachedBlockNumber(): Promise<number | null>;
}
//# sourceMappingURL=eth1DataCache.d.ts.map