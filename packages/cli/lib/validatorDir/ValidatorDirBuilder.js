"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorDirBuilder = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const bls_1 = __importDefault(require("@chainsafe/bls"));
const ValidatorDir_1 = require("./ValidatorDir");
const depositData_1 = require("../depositContract/depositData");
const util_1 = require("../util");
const paths_1 = require("./paths");
/**
 * A builder for creating a `ValidatorDir`.
 */
class ValidatorDirBuilder {
    /**
     * Instantiate a new builder.
     */
    constructor({ keystoresDir, secretsDir }) {
        (0, util_1.ensureDirExists)(keystoresDir);
        (0, util_1.ensureDirExists)(secretsDir);
        this.keystoresDir = keystoresDir;
        this.secretsDir = secretsDir;
    }
    async build({ keystores, passwords, storeWithdrawalKeystore, depositGwei, config, }) {
        const keystoresDir = this.keystoresDir;
        const secretsDir = this.secretsDir;
        const pubkey = keystores.signing.pubkey;
        if (!pubkey)
            throw Error("signing keystore has no pubkey");
        const dir = (0, paths_1.getValidatorDirPath)({ keystoresDir, pubkey, prefixed: true });
        if (node_fs_1.default.existsSync(dir) || node_fs_1.default.existsSync((0, paths_1.getValidatorDirPath)({ keystoresDir, pubkey }))) {
            throw new util_1.YargsError(`validator dir for ${pubkey} already exists`);
        }
        node_fs_1.default.mkdirSync(dir, { recursive: true });
        const withdrawalPublicKey = bls_1.default.PublicKey.fromHex(keystores.withdrawal.pubkey);
        const votingPrivateKey = bls_1.default.SecretKey.fromBytes(await keystores.signing.decrypt(passwords.signing));
        // Save `ETH1_DEPOSIT_DATA_FILE` to file.
        // This allows us to know the RLP data for the eth1 transaction without needing to know
        // the withdrawal/voting keypairs again at a later date.
        const depositDataRlp = (0, depositData_1.encodeDepositData)(depositGwei, withdrawalPublicKey, votingPrivateKey, config);
        node_fs_1.default.writeFileSync(node_path_1.default.join(dir, paths_1.ETH1_DEPOSIT_DATA_FILE), depositDataRlp);
        // Save `ETH1_DEPOSIT_AMOUNT_FILE` to file.
        // This allows us to know the intended deposit amount at a later date.
        node_fs_1.default.writeFileSync(node_path_1.default.join(dir, paths_1.ETH1_DEPOSIT_AMOUNT_FILE), depositGwei.toString());
        // Only the withdrawal keystore if explicitly required.
        if (storeWithdrawalKeystore) {
            node_fs_1.default.writeFileSync(node_path_1.default.join(dir, paths_1.WITHDRAWAL_KEYSTORE_FILE), keystores.withdrawal.stringify());
            (0, util_1.writeValidatorPassphrase)({ secretsDir, pubkey: keystores.withdrawal.pubkey, passphrase: passwords.withdrawal });
        }
        // Always store voting credentials
        node_fs_1.default.writeFileSync(node_path_1.default.join(dir, paths_1.VOTING_KEYSTORE_FILE), keystores.signing.stringify());
        (0, util_1.writeValidatorPassphrase)({ secretsDir, pubkey, passphrase: passwords.signing });
        return new ValidatorDir_1.ValidatorDir(this.keystoresDir, pubkey);
    }
}
exports.ValidatorDirBuilder = ValidatorDirBuilder;
//# sourceMappingURL=ValidatorDirBuilder.js.map