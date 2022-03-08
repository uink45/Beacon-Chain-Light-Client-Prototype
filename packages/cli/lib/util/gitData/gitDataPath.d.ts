/**
 * Persist git data and distribute through NPM so CLI consumers can know exactly
 * at what commit was this src build. This is used in the metrics and to log initially.
 */
/**
 * WARNING!! If you change this path make sure to update:
 * - 'packages/cli/package.json' -> .files -> `".git-data.json"`
 */
export declare const gitDataPath: string;
/** Git data type used to construct version information string and persistence. */
export declare type GitData = {
    /** v0.28.2 */
    semver?: string;
    /** "developer-feature" */
    branch?: string;
    /** "80c248bb392f512cc115d95059e22239a17bbd7d" */
    commit?: string;
    /** +7 (commits since last tag) */
    numCommits?: string;
};
/** Writes a persistent git data file. */
export declare function writeGitDataFile(gitData: GitData): void;
/** Reads the persistent git data file. */
export declare function readGitDataFile(): GitData;
//# sourceMappingURL=gitDataPath.d.ts.map