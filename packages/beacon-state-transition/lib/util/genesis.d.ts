import { List, TreeBacked } from "@chainsafe/ssz";
import { IBeaconConfig, IChainForkConfig } from "@chainsafe/lodestar-config";
import { allForks, Bytes32, bellatrix, Number64, phase0, Root, ValidatorIndex } from "@chainsafe/lodestar-types";
import { CachedBeaconStateAllForks } from "../types";
/**
 * Check if it's valid genesis state.
 * @param config
 * @param state
 */
export declare function isValidGenesisState(config: IChainForkConfig, state: allForks.BeaconState): boolean;
/**
 * Check if it's valid genesis validators state.
 * @param config
 * @param state
 */
export declare function isValidGenesisValidators(config: IChainForkConfig, state: allForks.BeaconState): boolean;
/**
 * Generate the initial beacon chain state.
 *
 * SLOW CODE - 🐢
 */
export declare function getGenesisBeaconState(config: IBeaconConfig, genesisEth1Data: phase0.Eth1Data, latestBlockHeader: phase0.BeaconBlockHeader): CachedBeaconStateAllForks;
/**
 * Apply eth1 block hash to state.
 * @param config IChainForkConfig
 * @param state BeaconState
 * @param eth1BlockHash eth1 block hash
 */
export declare function applyEth1BlockHash(state: allForks.BeaconState, eth1BlockHash: Bytes32): void;
/**
 * Apply eth1 block timestamp to state.
 * @param config IBeaconState
 * @param state BeaconState
 * @param eth1Timestamp eth1 block timestamp
 */
export declare function applyTimestamp(config: IChainForkConfig, state: TreeBacked<allForks.BeaconState>, eth1Timestamp: number): void;
/**
 * Apply deposits to state.
 * For spec test, fullDepositDataRootList is undefined.
 * For genesis builder, fullDepositDataRootList is full list of deposit data root from index 0.
 *
 * SLOW CODE - 🐢
 *
 * @param config IChainForkConfig
 * @param state BeaconState
 * @param newDeposits new deposits
 * @param fullDepositDataRootList full list of deposit data root from index 0
 * @returns active validator indices
 */
export declare function applyDeposits(config: IChainForkConfig, state: CachedBeaconStateAllForks, newDeposits: phase0.Deposit[], fullDepositDataRootList?: TreeBacked<List<Root>>): ValidatorIndex[];
/**
 * Mainly used for spec test.
 *
 * SLOW CODE - 🐢
 *
 * @param config
 * @param eth1BlockHash
 * @param eth1Timestamp
 * @param deposits
 */
export declare function initializeBeaconStateFromEth1(config: IChainForkConfig, eth1BlockHash: Bytes32, eth1Timestamp: Number64, deposits: phase0.Deposit[], fullDepositDataRootList?: TreeBacked<List<Root>>, executionPayloadHeader?: TreeBacked<bellatrix.ExecutionPayloadHeader>): TreeBacked<allForks.BeaconState>;
//# sourceMappingURL=genesis.d.ts.map