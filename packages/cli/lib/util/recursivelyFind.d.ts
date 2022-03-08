/**
 * Find files recursively in `dirPath` whose filename matches a custom function
 * @param dirPath
 * Return `true` for a given filepath to be included
 * @param filenameMatcher
 */
export declare function recursivelyFind(dirPath: string, filenameMatcher: (filename: string) => boolean): string[];
/**
 * Find voting keystores recursively in `dirPath`
 */
export declare function recursivelyFindVotingKeystores(dirPath: string): string[];
/**
 * Returns `true` if we should consider the `filename` to represent a voting keystore.
 */
export declare function isVotingKeystore(filename: string): boolean;
/**
 * Returns true if filename is a BLS Keystore passphrase file
 */
export declare function isPassphraseFile(filename: string): boolean;
//# sourceMappingURL=recursivelyFind.d.ts.map