export declare const VOTING_KEYSTORE_FILE = "voting-keystore.json";
export declare const WITHDRAWAL_KEYSTORE_FILE = "withdrawal-keystore.json";
export declare const ETH1_DEPOSIT_DATA_FILE = "eth1-deposit-data.rlp";
export declare const ETH1_DEPOSIT_AMOUNT_FILE = "eth1-deposit-gwei.txt";
export declare const ETH1_DEPOSIT_TX_HASH_FILE = "eth1-deposit-tx-hash.txt";
/**
 * The file used for indicating if a directory is in-use by another process.
 */
export declare const LOCK_FILE = ".lock";
export declare function getValidatorDirPath({ keystoresDir, pubkey, prefixed, }: {
    keystoresDir: string;
    pubkey: string;
    prefixed?: boolean;
}): string;
export declare function getValidatorPassphrasePath({ secretsDir, pubkey, prefixed, }: {
    secretsDir: string;
    pubkey: string;
    prefixed?: boolean;
}): string;
//# sourceMappingURL=paths.d.ts.map