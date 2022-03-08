export declare type TestToDownload = "general" | "mainnet" | "minimal";
export declare const defaultTestsToDownload: TestToDownload[];
export declare const defaultSpecTestsRepoUrl = "https://github.com/ethereum/consensus-spec-tests";
export interface IDownloadTestsOptions {
    specVersion: string;
    outputDir: string;
    specTestsRepoUrl?: string;
    testsToDownload?: TestToDownload[];
}
export interface IDownloadGenericTestsOptions<TestNames extends string> {
    specVersion: string;
    outputDir: string;
    specTestsRepoUrl: string;
    testsToDownload: TestNames[];
}
/**
 * Download spec tests
 */
export declare function downloadTests({ specVersion, specTestsRepoUrl, outputDir, testsToDownload }: IDownloadTestsOptions, log?: (msg: string) => void): Promise<void>;
/**
 * Generic Github release downloader.
 * Used by spec tests and SlashingProtectionInterchangeTest
 */
export declare function downloadGenericSpecTests<TestNames extends string>({ specVersion, specTestsRepoUrl, outputDir, testsToDownload }: IDownloadGenericTestsOptions<TestNames>, log?: (msg: string) => void): Promise<void>;
//# sourceMappingURL=downloadTests.d.ts.map