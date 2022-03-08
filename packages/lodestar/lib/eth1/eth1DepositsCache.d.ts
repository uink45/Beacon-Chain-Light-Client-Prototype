import { phase0 } from "@chainsafe/lodestar-types";
import { IFilterOptions } from "@chainsafe/lodestar-db";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { IBeaconDb } from "../db";
import { Eth1Block } from "./interface";
export declare class Eth1DepositsCache {
    unsafeAllowDepositDataOverwrite: boolean;
    db: IBeaconDb;
    config: IChainForkConfig;
    constructor(opts: {
        unsafeAllowDepositDataOverwrite: boolean;
    }, config: IChainForkConfig, db: IBeaconDb);
    /**
     * Returns a list of `Deposit` objects, within the given deposit index `range`.
     *
     * The `depositCount` is used to generate the proofs for the `Deposits`. For example, if we
     * have 100 proofs, but the eth2 chain only acknowledges 50 of them, we must produce our
     * proofs with respect to a tree size of 50.
     */
    get(indexRange: IFilterOptions<number>, eth1Data: phase0.Eth1Data): Promise<phase0.Deposit[]>;
    /**
     * Add log to cache
     * This function enforces that `logs` are imported one-by-one with consecutive indexes
     */
    add(depositEvents: phase0.DepositEvent[]): Promise<void>;
    /**
     * Appends partial eth1 data (depositRoot, depositCount) in a block range (inclusive)
     * Returned array is sequential and ascending in blockNumber
     * @param fromBlock
     * @param toBlock
     */
    getEth1DataForBlocks(blocks: Eth1Block[], lastProcessedDepositBlockNumber: number | null): Promise<(phase0.Eth1Data & Eth1Block)[]>;
    /**
     * Returns the highest blockNumber stored in DB if any
     */
    getHighestDepositEventBlockNumber(): Promise<number | null>;
    /**
     * Returns the lowest blockNumber stored in DB if any
     */
    getLowestDepositEventBlockNumber(): Promise<number | null>;
}
//# sourceMappingURL=eth1DepositsCache.d.ts.map