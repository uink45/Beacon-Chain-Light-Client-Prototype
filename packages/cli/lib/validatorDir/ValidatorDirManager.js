"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorDirManager = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const ValidatorDir_1 = require("./ValidatorDir");
const util_1 = require("../util");
/**
 * Manages a directory containing multiple `ValidatorDir` directories.
 *
 * Example:
 * ```
 * validators
 * └── 0x91494d3ac4c078049f37aa46934ba8cd...
 *     ├── eth1_deposit_data.rlp
 *     ├── deposit-tx-hash.txt
 *     ├── voting-keystore.json
 *     └── withdrawal-keystore.json
 * └── 0xb9bcfeb3c752a36c9edc5b9028c984a6...
 * ```
 */
class ValidatorDirManager {
    /**
     * Open a directory containing multiple validators.
     */
    constructor({ keystoresDir, secretsDir }) {
        if (!node_fs_1.default.existsSync(keystoresDir))
            throw new util_1.YargsError(`keystoresDir ${keystoresDir} does not exist`);
        if (!node_fs_1.default.existsSync(secretsDir))
            throw new util_1.YargsError(`secretsDir ${secretsDir} does not exist`);
        this.keystoresDir = keystoresDir;
        this.secretsDir = secretsDir;
    }
    /**
     * Iterate the nodes in `this.keystoresDir`, filtering out things that are unlikely to be
     * a validator directory.
     */
    iterDir() {
        return node_fs_1.default
            .readdirSync(this.keystoresDir)
            .filter((pubkey) => node_fs_1.default.statSync(node_path_1.default.join(this.keystoresDir, pubkey)).isDirectory());
    }
    /**
     * Open a `ValidatorDir` at the given `path`.
     * *Note*: It is not enforced that `path` is contained in `this.dir`.
     */
    openValidator(pubkey, options) {
        return new ValidatorDir_1.ValidatorDir(this.keystoresDir, pubkey, options);
    }
    /**
     * Opens all the validator directories in `this`.
     * *Note*: Returns an error if any of the directories is unable to be opened
     */
    openAllValidators(options) {
        return this.iterDir().map((pubkey) => this.openValidator(pubkey, options));
    }
    /**
     * Opens the given validator and decrypts its secretKeys.
     */
    async decryptValidator(pubkey, options) {
        const validator = this.openValidator(pubkey, options);
        return await validator.votingKeypair(this.secretsDir);
    }
    /**
     * Opens all the validator directories in `this` and decrypts the validator secretKeys.
     */
    async decryptAllValidators(options) {
        const validators = this.openAllValidators(options);
        return await Promise.all(validators.map(async (validator) => validator.votingKeypair(this.secretsDir)));
    }
}
exports.ValidatorDirManager = ValidatorDirManager;
//# sourceMappingURL=ValidatorDirManager.js.map