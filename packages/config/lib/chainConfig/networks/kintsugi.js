"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kintsugiChainConfig = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const ssz_1 = require("@chainsafe/ssz");
const mainnet_1 = require("../presets/mainnet");
/* eslint-disable max-len */
exports.kintsugiChainConfig = {
    ...mainnet_1.chainConfig,
    MIN_GENESIS_ACTIVE_VALIDATOR_COUNT: 72100,
    // Dec 16th, 2021, 13:00 UTC
    MIN_GENESIS_TIME: 1639659600,
    // Gensis fork
    GENESIS_FORK_VERSION: (0, ssz_1.fromHexString)("0x60000069"),
    // 300 seconds (5 min)
    GENESIS_DELAY: 300,
    // Forking
    ALTAIR_FORK_VERSION: (0, ssz_1.fromHexString)("0x61000070"),
    ALTAIR_FORK_EPOCH: 10,
    // Bellatrix
    BELLATRIX_FORK_VERSION: (0, ssz_1.fromHexString)("0x62000071"),
    BELLATRIX_FORK_EPOCH: 20,
    TERMINAL_TOTAL_DIFFICULTY: BigInt(5000000000),
    // Sharding
    SHARDING_FORK_VERSION: (0, ssz_1.fromHexString)("0x03000000"),
    SHARDING_FORK_EPOCH: Infinity,
    // Time parameters
    // ---------------------------------------------------------------
    // 16 blocks is ~190s
    ETH1_FOLLOW_DISTANCE: 16,
    // Deposit contract
    // ---------------------------------------------------------------
    // Custom Ethereum testnet
    DEPOSIT_CHAIN_ID: 1337702,
    DEPOSIT_NETWORK_ID: 1337702,
    DEPOSIT_CONTRACT_ADDRESS: (0, ssz_1.fromHexString)("0x4242424242424242424242424242424242424242"),
};
//# sourceMappingURL=kintsugi.js.map