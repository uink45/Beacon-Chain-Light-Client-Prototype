"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEth1Block = exports.Eth1Provider = void 0;
const ssz_1 = require("@chainsafe/ssz");
const chunkify_1 = require("../../util/chunkify");
const numpy_1 = require("../../util/numpy");
const retry_1 = require("../../util/retry");
const depositContract_1 = require("../utils/depositContract");
const address_1 = require("../../util/address");
const jsonRpcHttpClient_1 = require("./jsonRpcHttpClient");
const utils_1 = require("./utils");
class Eth1Provider {
    constructor(config, opts, signal) {
        var _a;
        this.deployBlock = (_a = opts.depositContractDeployBlock) !== null && _a !== void 0 ? _a : 0;
        this.depositContractAddress = (0, ssz_1.toHexString)(config.DEPOSIT_CONTRACT_ADDRESS);
        this.rpc = new jsonRpcHttpClient_1.JsonRpcHttpClient(opts.providerUrls, {
            signal,
            // Don't fallback with is truncated error. Throw early and let the retry on this class handle it
            shouldNotFallback: utils_1.isJsonRpcTruncatedError,
        });
    }
    async validateContract() {
        if (!(0, address_1.isValidAddress)(this.depositContractAddress)) {
            throw Error(`Invalid contract address: ${this.depositContractAddress}`);
        }
        const code = await this.getCode(this.depositContractAddress);
        if (!code || code === "0x") {
            throw new Error(`There is no deposit contract at given address: ${this.depositContractAddress}`);
        }
    }
    async getDepositEvents(fromBlock, toBlock) {
        const logsRawArr = await (0, retry_1.retry)((attempt) => {
            // Large log requests can return with code 200 but truncated, with broken JSON
            // This retry will split a given block range into smaller ranges exponentially
            // The underlying http client should handle network errors and retry
            const chunkCount = 2 ** (attempt - 1);
            const blockRanges = (0, chunkify_1.chunkifyInclusiveRange)(fromBlock, toBlock, chunkCount);
            return Promise.all(blockRanges.map(([from, to]) => {
                const options = {
                    fromBlock: from,
                    toBlock: to,
                    address: this.depositContractAddress,
                    topics: depositContract_1.depositEventTopics,
                };
                return this.getLogs(options);
            }));
        }, {
            retries: 3,
            retryDelay: 3000,
            shouldRetry: utils_1.isJsonRpcTruncatedError,
        });
        return logsRawArr.flat(1).map((log) => (0, depositContract_1.parseDepositLog)(log));
    }
    /**
     * Fetches an arbitrary array of block numbers in batch
     */
    async getBlocksByNumber(fromBlock, toBlock) {
        const method = "eth_getBlockByNumber";
        const blocksArr = await (0, retry_1.retry)((attempt) => {
            // Large batch requests can return with code 200 but truncated, with broken JSON
            // This retry will split a given block range into smaller ranges exponentially
            // The underlying http client should handle network errors and retry
            const chunkCount = 2 ** (attempt - 1);
            const blockRanges = (0, chunkify_1.chunkifyInclusiveRange)(fromBlock, toBlock, chunkCount);
            return Promise.all(blockRanges.map(([from, to]) => this.rpc.fetchBatch((0, numpy_1.linspace)(from, to).map((blockNumber) => ({ method, params: [(0, utils_1.numToQuantity)(blockNumber), false] })))));
        }, {
            retries: 3,
            retryDelay: 3000,
            shouldRetry: utils_1.isJsonRpcTruncatedError,
        });
        const blocks = [];
        for (const block of blocksArr.flat(1)) {
            if (block)
                blocks.push(block);
        }
        return blocks;
    }
    async getBlockByNumber(blockNumber) {
        const method = "eth_getBlockByNumber";
        const blockNumberHex = typeof blockNumber === "string" ? blockNumber : (0, utils_1.numToQuantity)(blockNumber);
        return await this.rpc.fetch({
            method,
            // false = include only transaction roots, not full objects
            params: [blockNumberHex, false],
        });
    }
    async getBlockByHash(blockHashHex) {
        const method = "eth_getBlockByHash";
        return await this.rpc.fetch({
            method,
            // false = include only transaction roots, not full objects
            params: [blockHashHex, false],
        });
    }
    async getBlockNumber() {
        const method = "eth_blockNumber";
        const blockNumberRaw = await this.rpc.fetch({ method, params: [] });
        return parseInt(blockNumberRaw, 16);
    }
    async getCode(address) {
        const method = "eth_getCode";
        return await this.rpc.fetch({ method, params: [address, "latest"] });
    }
    async getLogs(options) {
        const method = "eth_getLogs";
        const hexOptions = {
            ...options,
            fromBlock: (0, utils_1.numToQuantity)(options.fromBlock),
            toBlock: (0, utils_1.numToQuantity)(options.toBlock),
        };
        const logsRaw = await this.rpc.fetch({ method, params: [hexOptions] });
        return logsRaw.map((logRaw) => ({
            blockNumber: parseInt(logRaw.blockNumber, 16),
            data: logRaw.data,
            topics: logRaw.topics,
        }));
    }
}
exports.Eth1Provider = Eth1Provider;
function parseEth1Block(blockRaw) {
    if (typeof blockRaw !== "object")
        throw Error("block is not an object");
    return {
        blockHash: (0, utils_1.dataToBytes)(blockRaw.hash, 32),
        blockNumber: (0, utils_1.quantityToNum)(blockRaw.number, "block.number"),
        timestamp: (0, utils_1.quantityToNum)(blockRaw.timestamp, "block.timestamp"),
    };
}
exports.parseEth1Block = parseEth1Block;
//# sourceMappingURL=eth1Provider.js.map