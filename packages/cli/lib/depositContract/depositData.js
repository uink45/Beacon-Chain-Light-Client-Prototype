"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeDepositData = exports.decodeEth1TxData = void 0;
const ethers_1 = require("ethers");
const ssz_1 = require("@chainsafe/ssz");
const lodestar_types_1 = require("@chainsafe/lodestar-types");
const bls_1 = __importDefault(require("@chainsafe/bls"));
const lodestar_beacon_state_transition_1 = require("@chainsafe/lodestar-beacon-state-transition");
const lodestar_params_1 = require("@chainsafe/lodestar-params");
const depositFunctionFragment = "function deposit(bytes pubkey, bytes withdrawal_credentials, bytes signature, bytes32 deposit_data_root) external payable;";
function getDepositInterface() {
    return new ethers_1.ethers.utils.Interface([depositFunctionFragment]);
}
function decodeEth1TxData(bytes, amount) {
    const depositContract = getDepositInterface();
    const inputs = depositContract.decodeFunctionData("deposit", bytes);
    const { deposit_data_root: root } = inputs;
    const depositData = lodestar_types_1.ssz.phase0.DepositData.fromJson(
    // attach `amount` to decoded deposit inputs so it can be parsed to a DepositData
    { ...inputs, amount }, { case: "snake" });
    // Sanity check
    const depositDataRoot = lodestar_types_1.ssz.phase0.DepositData.hashTreeRoot(depositData);
    if ((0, ssz_1.toHexString)(depositDataRoot) !== root)
        throw Error("deposit data root mismatch");
    return { depositData, root: root };
}
exports.decodeEth1TxData = decodeEth1TxData;
function encodeDepositData(amount, withdrawalPublicKey, signingKey, config) {
    const pubkey = signingKey.toPublicKey().toBytes();
    const withdrawalCredentials = Buffer.concat([lodestar_params_1.BLS_WITHDRAWAL_PREFIX, (0, ssz_1.hash)(withdrawalPublicKey.toBytes()).slice(1)]);
    // deposit data with empty signature to sign
    const depositData = {
        pubkey,
        withdrawalCredentials,
        amount,
        signature: Buffer.alloc(96),
    };
    const domain = (0, lodestar_beacon_state_transition_1.computeDomain)(lodestar_params_1.DOMAIN_DEPOSIT, config.GENESIS_FORK_VERSION, lodestar_beacon_state_transition_1.ZERO_HASH);
    const signingroot = (0, lodestar_beacon_state_transition_1.computeSigningRoot)(lodestar_types_1.ssz.phase0.DepositMessage, depositData, domain);
    depositData.signature = bls_1.default.sign(signingKey.toBytes(), signingroot);
    const depositDataRoot = lodestar_types_1.ssz.phase0.DepositData.hashTreeRoot(depositData);
    const depositContract = getDepositInterface();
    return depositContract.encodeFunctionData("deposit", [
        pubkey,
        withdrawalCredentials,
        depositData.signature,
        depositDataRoot,
    ]);
}
exports.encodeDepositData = encodeDepositData;
//# sourceMappingURL=depositData.js.map