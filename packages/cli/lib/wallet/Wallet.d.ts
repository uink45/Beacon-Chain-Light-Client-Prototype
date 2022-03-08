import { Keystore } from "@chainsafe/bls-keystore";
import { IEth2ValidatorKeys } from "@chainsafe/bls-keygen";
/**
 * @chainsafe/bls-keystore@1.0.0-beta8 requires a pubKey argument
 * While the library is not agnostic use this empty value
 */
export interface IWalletKeystoreJson {
    crypto: Record<string, unknown>;
    uuid: string;
    name: string;
    nextaccount: number;
    version: number;
    type: string;
}
export declare class Wallet extends Keystore {
    name?: string;
    nextaccount: number;
    version: number;
    type: string;
    constructor(keystore: Partial<IWalletKeystoreJson>);
    /**
     * Creates a new builder for a seed specified as a BIP-39 `Mnemonic` (where the nmemonic itself does
     * not have a passphrase).
     */
    static fromMnemonic(mnemonic: string, password: string, name: string): Promise<Wallet>;
    /**
     * Returns wallet data to write to disk as a parsed object
     */
    toWalletObject(): IWalletKeystoreJson;
    /**
     * Returns wallet data to write to disk as stringified JSON
     */
    toWalletJSON(): string;
    /**
     * Produces a `Keystore` (encrypted with `keystore_password`) for the validator at
     * `self.nextaccount`, incrementing `self.nextaccount` if the keystore was successfully
     * generated.
     *
     * Uses the default encryption settings of `KeystoreBuilder`, not necessarily those that were
     * used to encrypt `this`.
     */
    nextValidator(walletPassword: string, passwords: {
        [key in keyof IEth2ValidatorKeys]: string;
    }): Promise<{
        [key in keyof IEth2ValidatorKeys]: Keystore;
    }>;
    /**
     * Utility function to generate passwords for the two eth2 pair keystores
     */
    randomPasswords(): {
        [key in keyof IEth2ValidatorKeys]: string;
    };
}
//# sourceMappingURL=Wallet.d.ts.map