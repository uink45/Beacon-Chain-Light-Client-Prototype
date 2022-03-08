import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { CachedBeaconStateAllForks } from "@chainsafe/lodestar-beacon-state-transition";
import { ILogger } from "@chainsafe/lodestar-utils";
import { AbortSignal } from "@chainsafe/abort-controller";
import { IBeaconDb } from "../db";
import { Eth1DataAndDeposits, IEth1Provider } from "./interface";
import { Eth1Options } from "./options";
export declare type Eth1DepositDataTrackerModules = {
    config: IChainForkConfig;
    db: IBeaconDb;
    logger: ILogger;
    signal: AbortSignal;
};
/**
 * Main class handling eth1 data fetching, processing and storing
 * Upon instantiation, starts fetcheing deposits and blocks at regular intervals
 */
export declare class Eth1DepositDataTracker {
    private readonly eth1Provider;
    private config;
    private logger;
    private signal;
    private depositsCache;
    private eth1DataCache;
    private lastProcessedDepositBlockNumber;
    constructor(opts: Eth1Options, { config, db, logger, signal }: Eth1DepositDataTrackerModules, eth1Provider: IEth1Provider);
    /**
     * Return eth1Data and deposits ready for block production for a given state
     */
    getEth1DataAndDeposits(state: CachedBeaconStateAllForks): Promise<Eth1DataAndDeposits>;
    /**
     * Returns an eth1Data vote for a given state.
     * Requires internal caches to be updated regularly to return good results
     */
    private getEth1Data;
    /**
     * Returns deposits to be included for a given state and eth1Data vote.
     * Requires internal caches to be updated regularly to return good results
     */
    private getDeposits;
    /**
     * Abortable async setInterval that runs its callback once at max between `ms` at minimum
     */
    private runAutoUpdate;
    /**
     * Update the deposit and block cache, returning an error if either fail
     * @returns true if it has catched up to the remote follow block
     */
    private update;
    /**
     * Fetch deposit events from remote eth1 node up to follow-distance block
     * @returns true if it has catched up to the remote follow block
     */
    private updateDepositCache;
    /**
     * Fetch block headers from a remote eth1 node up to follow-distance block
     *
     * depositRoot and depositCount are inferred from already fetched deposits.
     * Calling get_deposit_root() and the smart contract for a non-latest block requires an
     * archive node, something most users don't have access too.
     * @returns true if it has catched up to the remote follow block
     */
    private updateBlockCache;
    private getFromBlockToFetch;
    private getLastProcessedDepositBlockNumber;
}
//# sourceMappingURL=eth1DepositDataTracker.d.ts.map