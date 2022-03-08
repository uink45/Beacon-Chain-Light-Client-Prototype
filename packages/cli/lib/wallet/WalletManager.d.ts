import { Wallet, IWalletKeystoreJson } from "./Wallet";
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
export declare class WalletManager {
    walletsDir: string;
    /**
     * Open a directory containing multiple validators.
     */
    constructor({ walletsDir }: {
        walletsDir: string;
    });
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
    wallets(): IWalletKeystoreJson[];
    /**
     * Opens and searches all wallets in `self.dir` and returns the wallet with this name.
     */
    openByName(name: string): Wallet;
    /**
     * Persist wallet info to disk
     */
    writeWallet(wallet: Wallet): void;
    /**
     * Creates a new wallet with the given `name` in `self.dir` with the given `mnemonic` as a
     * seed, encrypted with `password`.
     */
    createWallet(name: string, walletType: string, mnemonic: string, password: string): Promise<Wallet>;
}
//# sourceMappingURL=WalletManager.d.ts.map