import { Keystore } from "@chainsafe/bls-keystore";
import { IEth2ValidatorKeys } from "@chainsafe/bls-keygen";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { ValidatorDir } from "./ValidatorDir";
interface IValidatorDirBuildOptions {
    keystores: {
        [key in keyof IEth2ValidatorKeys]: Keystore;
    };
    passwords: {
        [key in keyof IEth2ValidatorKeys]: string;
    };
    /**
     * If `should_store == true`, the validator keystore will be saved in the `ValidatorDir` (and
     * the password to it stored in the `password_dir`). If `should_store == false`, the
     * withdrawal keystore will be dropped after `Self::build`.
     *
     * ## Notes
     *
     * If `should_store == false`, it is important to ensure that the withdrawal keystore is
     * backed up. Backup can be via saving the files elsewhere, or in the case of HD key
     * derivation, ensuring the seed and path are known.
     *
     * If the builder is not specifically given a withdrawal keystore then one will be generated
     * randomly. When this random keystore is generated, calls to this function are ignored and
     * the withdrawal keystore is *always* stored to disk. This is to prevent data loss.
     */
    storeWithdrawalKeystore?: boolean;
    depositGwei: number;
    config: IChainForkConfig;
}
/**
 * A builder for creating a `ValidatorDir`.
 */
export declare class ValidatorDirBuilder {
    keystoresDir: string;
    secretsDir: string;
    /**
     * Instantiate a new builder.
     */
    constructor({ keystoresDir, secretsDir }: {
        keystoresDir: string;
        secretsDir: string;
    });
    build({ keystores, passwords, storeWithdrawalKeystore, depositGwei, config, }: IValidatorDirBuildOptions): Promise<ValidatorDir>;
}
export {};
//# sourceMappingURL=ValidatorDirBuilder.d.ts.map