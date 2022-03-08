/**
 * Utility to read file as UTF8 and strip any trailing new lines.
 * All passphrase files must be read with this function
 */
export declare function readPassphraseFile(passphraseFile: string): string;
export declare function readValidatorPassphrase({ secretsDir, pubkey }: {
    secretsDir: string;
    pubkey: string;
}): string;
export declare function writeValidatorPassphrase({ secretsDir, pubkey, passphrase, }: {
    secretsDir: string;
    pubkey: string;
    passphrase: string;
}): void;
//# sourceMappingURL=passphrase.d.ts.map