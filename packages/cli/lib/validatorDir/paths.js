"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidatorPassphrasePath = exports.getValidatorDirPath = exports.LOCK_FILE = exports.ETH1_DEPOSIT_TX_HASH_FILE = exports.ETH1_DEPOSIT_AMOUNT_FILE = exports.ETH1_DEPOSIT_DATA_FILE = exports.WITHDRAWAL_KEYSTORE_FILE = exports.VOTING_KEYSTORE_FILE = void 0;
const node_path_1 = __importDefault(require("node:path"));
const format_1 = require("../util/format");
exports.VOTING_KEYSTORE_FILE = "voting-keystore.json";
exports.WITHDRAWAL_KEYSTORE_FILE = "withdrawal-keystore.json";
exports.ETH1_DEPOSIT_DATA_FILE = "eth1-deposit-data.rlp";
exports.ETH1_DEPOSIT_AMOUNT_FILE = "eth1-deposit-gwei.txt";
exports.ETH1_DEPOSIT_TX_HASH_FILE = "eth1-deposit-tx-hash.txt";
/**
 * The file used for indicating if a directory is in-use by another process.
 */
exports.LOCK_FILE = ".lock";
// Dynamic paths computed from the validator pubkey
function getValidatorDirPath({ keystoresDir, pubkey, prefixed, }) {
    return node_path_1.default.join(keystoresDir, prefixed ? (0, format_1.add0xPrefix)(pubkey) : pubkey);
}
exports.getValidatorDirPath = getValidatorDirPath;
function getValidatorPassphrasePath({ secretsDir, pubkey, prefixed, }) {
    return node_path_1.default.join(secretsDir, prefixed ? (0, format_1.add0xPrefix)(pubkey) : pubkey);
}
exports.getValidatorPassphrasePath = getValidatorPassphrasePath;
//# sourceMappingURL=paths.js.map