"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chainConfig = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const ssz_1 = require("@chainsafe/ssz");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
exports.chainConfig = {
    PRESET_BASE: lodestar_params_1.PresetName.mainnet,
    // Transition
    // TBD, 2**256-1 is a placeholder
    TERMINAL_TOTAL_DIFFICULTY: BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935),
    TERMINAL_BLOCK_HASH: (0, ssz_1.fromHexString)("0x0000000000000000000000000000000000000000000000000000000000000000"),
    TERMINAL_BLOCK_HASH_ACTIVATION_EPOCH: Infinity,
    // Genesis
    // ---------------------------------------------------------------
    // `2**14` (= 16,384)
    MIN_GENESIS_ACTIVE_VALIDATOR_COUNT: 16384,
    // Dec 1, 2020, 12pm UTC
    MIN_GENESIS_TIME: 1606824000,
    // Mainnet initial fork version, recommend altering for testnets
    GENESIS_FORK_VERSION: (0, ssz_1.fromHexString)("0x00000000"),
    // 604800 seconds (7 days)
    GENESIS_DELAY: 604800,
    // Forking
    // ---------------------------------------------------------------
    // Some forks are disabled for now:
    //  - These may be re-assigned to another fork-version later
    //  - Temporarily set to max uint64 value: 2**64 - 1
    // Altair
    ALTAIR_FORK_VERSION: (0, ssz_1.fromHexString)("0x01000000"),
    ALTAIR_FORK_EPOCH: 74240,
    // Bellatrix
    BELLATRIX_FORK_VERSION: (0, ssz_1.fromHexString)("0x02000000"),
    BELLATRIX_FORK_EPOCH: Infinity,
    // Sharding
    SHARDING_FORK_VERSION: (0, ssz_1.fromHexString)("0x03000000"),
    SHARDING_FORK_EPOCH: Infinity,
    // Time parameters
    // ---------------------------------------------------------------
    // 12 seconds
    SECONDS_PER_SLOT: 12,
    // 14 (estimate from Eth1 mainnet)
    SECONDS_PER_ETH1_BLOCK: 14,
    // 2**8 (= 256) epochs ~27 hours
    MIN_VALIDATOR_WITHDRAWABILITY_DELAY: 256,
    // 2**8 (= 256) epochs ~27 hours
    SHARD_COMMITTEE_PERIOD: 256,
    // 2**11 (= 2,048) Eth1 blocks ~8 hours
    ETH1_FOLLOW_DISTANCE: 2048,
    // Validator cycle
    // ---------------------------------------------------------------
    // 2**2 (= 4)
    INACTIVITY_SCORE_BIAS: 4,
    // 2**4 (= 16)
    INACTIVITY_SCORE_RECOVERY_RATE: 16,
    // 2**4 * 10**9 (= 16,000,000,000) Gwei
    EJECTION_BALANCE: 16000000000,
    // 2**2 (= 4)
    MIN_PER_EPOCH_CHURN_LIMIT: 4,
    // 2**16 (= 65,536)
    CHURN_LIMIT_QUOTIENT: 65536,
    PROPOSER_SCORE_BOOST: 70,
    // Deposit contract
    // ---------------------------------------------------------------
    // Ethereum PoW Mainnet
    DEPOSIT_CHAIN_ID: 1,
    DEPOSIT_NETWORK_ID: 1,
    DEPOSIT_CONTRACT_ADDRESS: (0, ssz_1.fromHexString)("0x00000000219ab540356cBB839Cbe05303d7705Fa"),
};
//# sourceMappingURL=mainnet.js.map