import { SecretKey } from "@chainsafe/bls";
import { phase0 } from "@chainsafe/lodestar-types";
export interface IValidatorDirOptions {
    force: boolean;
}
export interface IEth1DepositData {
    /**
     * An RLP encoded Eth1 transaction.
     */
    rlp: string;
    /**
     * The deposit data used to generate `self.rlp`
     */
    depositData: phase0.DepositData;
    /**
     * The root of `self.deposit_data`
     */
    root: string;
}
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
export declare class ValidatorDir {
    dir: string;
    private lockfilePath;
    /**
     * Open `dir`, creating a lockfile to prevent concurrent access.
     * Errors if there is a filesystem error or if a lockfile already exists
     * @param dir
     */
    constructor(baseDir: string, pubkey: string, options?: IValidatorDirOptions);
    /**
     * Removes the lockfile associated with this validator dir
     */
    close(): void;
    /**
     * Attempts to read the keystore in `this.dir` and decrypt the secretKey using
     * a password file in `password_dir`.
     * The password file that is used will be based upon the pubkey value in the keystore.
     * Errors if there is a filesystem error, a password is missing or the password is incorrect.
     * @param secretsDir
     */
    votingKeypair(secretsDir: string): Promise<SecretKey>;
    /**
     * Attempts to read the keystore in `this.dir` and decrypt the secretKey using
     * a password file in `password_dir`.
     * The password file that is used will be based upon the pubkey value in the keystore.
     * Errors if there is a filesystem error, a password is missing or the password is incorrect.
     * @param secretsDir
     */
    withdrawalKeypair(secretsDir: string): Promise<SecretKey>;
    /**
     * Decrypts a keystore in the validator's dir
     * @param keystorePath Path to a EIP-2335 keystore
     * @param secretsDir Directory containing keystore passwords
     */
    unlockKeypair(keystorePath: string, secretsDir: string): Promise<SecretKey>;
    /**
     * Indicates if there is a file containing an eth1 deposit transaction. This can be used to
     * check if a deposit transaction has been created.
     *
     * *Note*: It's possible to submit an Eth1 deposit without creating this file, so use caution
     * when relying upon this value.
     */
    eth1DepositTxHashExists(): boolean;
    /**
     * Saves the `tx_hash` to a file in `this.dir`.
     */
    saveEth1DepositTxHash(txHash: string): void;
    /**
     * Attempts to read files in `this.dir` and return an `Eth1DepositData` that can be used for
     * submitting an Eth1 deposit.
     */
    eth1DepositData(): IEth1DepositData;
}
//# sourceMappingURL=ValidatorDir.d.ts.map