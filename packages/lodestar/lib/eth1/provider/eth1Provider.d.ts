import { phase0 } from "@chainsafe/lodestar-types";
import { AbortSignal } from "@chainsafe/abort-controller";
import { IChainConfig } from "@chainsafe/lodestar-config";
import { Eth1Block, IEth1Provider } from "../interface";
import { Eth1Options } from "../options";
import { EthJsonRpcBlockRaw } from "../interface";
export declare class Eth1Provider implements IEth1Provider {
    readonly deployBlock: number;
    private readonly depositContractAddress;
    private readonly rpc;
    constructor(config: Pick<IChainConfig, "DEPOSIT_CONTRACT_ADDRESS">, opts: Pick<Eth1Options, "depositContractDeployBlock" | "providerUrls">, signal?: AbortSignal);
    validateContract(): Promise<void>;
    getDepositEvents(fromBlock: number, toBlock: number): Promise<phase0.DepositEvent[]>;
    /**
     * Fetches an arbitrary array of block numbers in batch
     */
    getBlocksByNumber(fromBlock: number, toBlock: number): Promise<EthJsonRpcBlockRaw[]>;
    getBlockByNumber(blockNumber: number | "latest"): Promise<EthJsonRpcBlockRaw | null>;
    getBlockByHash(blockHashHex: string): Promise<EthJsonRpcBlockRaw | null>;
    getBlockNumber(): Promise<number>;
    getCode(address: string): Promise<string>;
    getLogs(options: {
        fromBlock: number;
        toBlock: number;
        address: string;
        topics: string[];
    }): Promise<{
        blockNumber: number;
        data: string;
        topics: string[];
    }[]>;
}
export declare function parseEth1Block(blockRaw: EthJsonRpcBlockRaw): Eth1Block;
//# sourceMappingURL=eth1Provider.d.ts.map