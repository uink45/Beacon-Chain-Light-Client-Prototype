import { ValidatorDir, IValidatorDirOptions } from "./ValidatorDir";
import { SecretKey } from "@chainsafe/bls";
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
export declare class ValidatorDirManager {
    keystoresDir: string;
    secretsDir: string;
    /**
     * Open a directory containing multiple validators.
     */
    constructor({ keystoresDir, secretsDir }: {
        keystoresDir: string;
        secretsDir: string;
    });
    /**
     * Iterate the nodes in `this.keystoresDir`, filtering out things that are unlikely to be
     * a validator directory.
     */
    iterDir(): string[];
    /**
     * Open a `ValidatorDir` at the given `path`.
     * *Note*: It is not enforced that `path` is contained in `this.dir`.
     */
    openValidator(pubkey: string, options?: IValidatorDirOptions): ValidatorDir;
    /**
     * Opens all the validator directories in `this`.
     * *Note*: Returns an error if any of the directories is unable to be opened
     */
    openAllValidators(options?: IValidatorDirOptions): ValidatorDir[];
    /**
     * Opens the given validator and decrypts its secretKeys.
     */
    decryptValidator(pubkey: string, options?: IValidatorDirOptions): Promise<SecretKey>;
    /**
     * Opens all the validator directories in `this` and decrypts the validator secretKeys.
     */
    decryptAllValidators(options?: IValidatorDirOptions): Promise<SecretKey[]>;
}
//# sourceMappingURL=ValidatorDirManager.d.ts.map