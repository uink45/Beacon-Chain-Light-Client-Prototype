"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorDir = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const bls_1 = __importDefault(require("@chainsafe/bls"));
const bls_keystore_1 = require("@chainsafe/bls-keystore");
const util_1 = require("../util");
const depositData_1 = require("../depositContract/depositData");
const format_1 = require("../util/format");
const lockfile_1 = require("../util/lockfile");
const paths_1 = require("./paths");
/**
 * Provides a wrapper around a directory containing validator information
 * Creates/deletes a lockfile in `self.dir` to attempt to prevent concurrent
 * access from multiple processes.
 *
 * Example:
 * ```
 * 0x91494d3ac4c078049f37aa46934ba8cd...
 * ├── eth1_deposit_data.rlp
 * ├── deposit-tx-hash.txt
 * ├── voting-keystore.json
 * └── withdrawal-keystore.json
 * ```
 */
class ValidatorDir {
    /**
     * Open `dir`, creating a lockfile to prevent concurrent access.
     * Errors if there is a filesystem error or if a lockfile already exists
     * @param dir
     */
    constructor(baseDir, pubkey, options) {
        this.dir = node_path_1.default.join(baseDir, (0, format_1.add0xPrefix)(pubkey));
        this.lockfilePath = node_path_1.default.join(this.dir, paths_1.LOCK_FILE);
        if (!node_fs_1.default.existsSync(this.dir))
            throw new util_1.YargsError(`Validator directory ${this.dir} does not exist`);
        const lockFile = (0, lockfile_1.getLockFile)();
        try {
            lockFile.lockSync(this.lockfilePath);
        }
        catch (e) {
            if (options && options.force) {
                // Ignore error, maybe log?
            }
            else {
                throw e;
            }
        }
    }
    /**
     * Removes the lockfile associated with this validator dir
     */
    close() {
        (0, lockfile_1.getLockFile)().unlockSync(this.lockfilePath);
    }
    /**
     * Attempts to read the keystore in `this.dir` and decrypt the secretKey using
     * a password file in `password_dir`.
     * The password file that is used will be based upon the pubkey value in the keystore.
     * Errors if there is a filesystem error, a password is missing or the password is incorrect.
     * @param secretsDir
     */
    async votingKeypair(secretsDir) {
        const keystorePath = node_path_1.default.join(this.dir, paths_1.VOTING_KEYSTORE_FILE);
        return await this.unlockKeypair(keystorePath, secretsDir);
    }
    /**
     * Attempts to read the keystore in `this.dir` and decrypt the secretKey using
     * a password file in `password_dir`.
     * The password file that is used will be based upon the pubkey value in the keystore.
     * Errors if there is a filesystem error, a password is missing or the password is incorrect.
     * @param secretsDir
     */
    async withdrawalKeypair(secretsDir) {
        const keystorePath = node_path_1.default.join(this.dir, paths_1.WITHDRAWAL_KEYSTORE_FILE);
        return await this.unlockKeypair(keystorePath, secretsDir);
    }
    /**
     * Decrypts a keystore in the validator's dir
     * @param keystorePath Path to a EIP-2335 keystore
     * @param secretsDir Directory containing keystore passwords
     */
    async unlockKeypair(keystorePath, secretsDir) {
        const keystore = bls_keystore_1.Keystore.parse(node_fs_1.default.readFileSync(keystorePath, "utf8"));
        const password = (0, util_1.readValidatorPassphrase)({ secretsDir, pubkey: keystore.pubkey });
        const privKey = await keystore.decrypt(password);
        return bls_1.default.SecretKey.fromBytes(privKey);
    }
    /**
     * Indicates if there is a file containing an eth1 deposit transaction. This can be used to
     * check if a deposit transaction has been created.
     *
     * *Note*: It's possible to submit an Eth1 deposit without creating this file, so use caution
     * when relying upon this value.
     */
    eth1DepositTxHashExists() {
        return node_fs_1.default.existsSync(node_path_1.default.join(this.dir, paths_1.ETH1_DEPOSIT_TX_HASH_FILE));
    }
    /**
     * Saves the `tx_hash` to a file in `this.dir`.
     */
    saveEth1DepositTxHash(txHash) {
        const filepath = node_path_1.default.join(this.dir, paths_1.ETH1_DEPOSIT_TX_HASH_FILE);
        if (node_fs_1.default.existsSync(filepath))
            throw new util_1.YargsError(`ETH1_DEPOSIT_TX_HASH_FILE ${filepath} already exists`);
        node_fs_1.default.writeFileSync(filepath, txHash);
    }
    /**
     * Attempts to read files in `this.dir` and return an `Eth1DepositData` that can be used for
     * submitting an Eth1 deposit.
     */
    eth1DepositData() {
        const depositDataPath = node_path_1.default.join(this.dir, paths_1.ETH1_DEPOSIT_DATA_FILE);
        const depositAmountPath = node_path_1.default.join(this.dir, paths_1.ETH1_DEPOSIT_AMOUNT_FILE);
        const depositDataRlp = node_fs_1.default.readFileSync(depositDataPath, "utf8");
        const depositAmount = node_fs_1.default.readFileSync(depositAmountPath, "utf8");
        // This acts as a sanity check to ensure that the amount from `ETH1_DEPOSIT_AMOUNT_FILE`
        // matches the value that `ETH1_DEPOSIT_DATA_FILE` was created with.
        const { depositData, root } = (0, depositData_1.decodeEth1TxData)(depositDataRlp, depositAmount);
        return { rlp: depositDataRlp, depositData, root };
    }
}
exports.ValidatorDir = ValidatorDir;
//# sourceMappingURL=ValidatorDir.js.map