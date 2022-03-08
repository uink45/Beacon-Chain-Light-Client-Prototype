import { IBeaconNodeOptions } from "@chainsafe/lodestar";
import { IChainConfig, IChainForkConfig } from "@chainsafe/lodestar-config";
import { allForks } from "@chainsafe/lodestar-types";
import { Checkpoint } from "@chainsafe/lodestar-types/phase0";
import { RecursivePartial } from "@chainsafe/lodestar-utils";
import { TreeBacked } from "@chainsafe/ssz";
export declare type NetworkName = "mainnet" | "prater" | "kintsugi" | "dev";
export declare const networkNames: NetworkName[];
export declare type WeakSubjectivityFetchOptions = {
    weakSubjectivityServerUrl: string;
    weakSubjectivityCheckpoint?: string;
};
export declare function getNetworkBeaconParams(network: NetworkName): IChainConfig;
export declare function getNetworkBeaconNodeOptions(network: NetworkName): RecursivePartial<IBeaconNodeOptions>;
/**
 * Get genesisStateFile URL to download. Returns null if not available
 */
export declare function getGenesisFileUrl(network: NetworkName): string | null;
/**
 * Fetches the latest list of bootnodes for a network
 * Bootnodes file is expected to contain bootnode ENR's concatenated by newlines
 */
export declare function fetchBootnodes(network: NetworkName): Promise<string[]>;
/**
 * Reads and parses a list of bootnodes for a network from a file.
 */
export declare function readBootnodes(bootnodesFilePath: string): string[];
/**
 * Parses a file to get a list of bootnodes for a network.
 * Bootnodes file is expected to contain bootnode ENR's concatenated by newlines, or commas for
 * parsing plaintext, YAML, JSON and/or env files.
 */
export declare function parseBootnodesFile(bootnodesFile: string): string[];
/**
 * Parses a file to get a list of bootnodes for a network if given a valid path,
 * and returns the bootnodes in an "injectable" network options format.
 */
export declare function getInjectableBootEnrs(bootnodesFilepath: string): RecursivePartial<IBeaconNodeOptions>;
/**
 * Given an array of bootnodes, returns them in an injectable format
 */
export declare function enrsToNetworkConfig(enrs: string[]): RecursivePartial<IBeaconNodeOptions>;
/**
 * Fetch weak subjectivity state from a remote beacon node
 */
export declare function fetchWeakSubjectivityState(config: IChainForkConfig, { weakSubjectivityServerUrl, weakSubjectivityCheckpoint }: WeakSubjectivityFetchOptions): Promise<{
    wsState: TreeBacked<allForks.BeaconState>;
    wsCheckpoint: Checkpoint;
}>;
export declare function getCheckpointFromArg(checkpointStr: string): Checkpoint;
//# sourceMappingURL=index.d.ts.map