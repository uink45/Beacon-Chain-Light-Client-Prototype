"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletManager = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const uuidv4_1 = require("uuidv4");
const Wallet_1 = require("./Wallet");
const util_1 = require("../util");
/**
 * Manages a directory containing EIP-2386 wallets.
 *
 * Each wallet is stored in a directory with the name of the wallet UUID. Inside each directory a
 * EIP-2386 JSON wallet is also stored using the UUID as the filename.
 *
 * In each wallet directory an optional `.lock` exists to prevent concurrent reads and writes from
 * the same wallet.
 *
 * Example:
 *
 * ```bash
 * wallets
 * ├── 35c07717-c6f3-45e8-976f-ef5d267e86c9
 * |   └── 35c07717-c6f3-45e8-976f-ef5d267e86c9
 * └── 747ad9dc-e1a1-4804-ada4-0dc124e46c49
 *     ├── .lock
 *     ├── 747ad9dc-e1a1-4804-ada4-0dc124e46c49
 * ```
 */
class WalletManager {
    /**
     * Open a directory containing multiple validators.
     */
    constructor({ walletsDir }) {
        (0, util_1.ensureDirExists)(walletsDir);
        this.walletsDir = walletsDir;
    }
    /**
     * Iterates all wallets in `this.walletsDir` and returns a mapping of their name to their UUID.
     *
     * Ignores any items in `this.walletsDir` that:
     *
     * - Are files.
     * - Are directories, but their file-name does not parse as a UUID.
     *
     * This function is fairly strict, it will fail if any directory is found that does not obey
     * the expected structure (e.g., there is a UUID directory that does not contain a valid JSON
     * keystore with the same UUID).
     */
    wallets() {
        return node_fs_1.default
            .readdirSync(this.walletsDir)
            .filter((file) => (0, uuidv4_1.isUuid)(file) && node_fs_1.default.statSync(node_path_1.default.join(this.walletsDir, file)).isDirectory())
            .map((walletUuid) => {
            const walletInfoPath = node_path_1.default.join(this.walletsDir, walletUuid, walletUuid);
            const walletInfo = JSON.parse(node_fs_1.default.readFileSync(walletInfoPath, "utf8"));
            if (walletInfo.uuid !== walletUuid)
                throw new util_1.YargsError(`Wallet UUID mismatch, ${walletInfo.uuid} !== ${walletUuid}`);
            return walletInfo;
        });
    }
    /**
     * Opens and searches all wallets in `self.dir` and returns the wallet with this name.
     */
    openByName(name) {
        const wallets = this.wallets();
        const walletKeystore = wallets.find((w) => w.name === name);
        if (!walletKeystore)
            throw new util_1.YargsError(`Wallet ${name} not found`);
        return new Wallet_1.Wallet(walletKeystore);
    }
    /**
     * Persist wallet info to disk
     */
    writeWallet(wallet) {
        if (!wallet.uuid)
            throw new util_1.YargsError("Wallet UUID is not defined");
        const walletInfoPath = node_path_1.default.join(this.walletsDir, wallet.uuid, wallet.uuid);
        node_fs_1.default.writeFileSync(walletInfoPath, wallet.toWalletJSON());
    }
    /**
     * Creates a new wallet with the given `name` in `self.dir` with the given `mnemonic` as a
     * seed, encrypted with `password`.
     */
    async createWallet(name, walletType, mnemonic, password) {
        if (this.wallets().some((wallet) => wallet.name === name))
            throw new util_1.YargsError(`Wallet name ${name} already used`);
        const wallet = await Wallet_1.Wallet.fromMnemonic(mnemonic, password, name);
        const walletDir = node_path_1.default.join(this.walletsDir, wallet.uuid);
        if (node_fs_1.default.existsSync(walletDir))
            throw new util_1.YargsError(`Wallet dir ${walletDir} already exists`);
        node_fs_1.default.mkdirSync(walletDir, { recursive: true });
        this.writeWallet(wallet);
        return wallet;
    }
}
exports.WalletManager = WalletManager;
//# sourceMappingURL=WalletManager.js.map