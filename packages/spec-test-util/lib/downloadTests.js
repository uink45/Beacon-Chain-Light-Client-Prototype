"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadGenericSpecTests = exports.downloadTests = exports.defaultSpecTestsRepoUrl = exports.defaultTestsToDownload = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const rimraf_1 = __importDefault(require("rimraf"));
const axios_1 = __importDefault(require("axios"));
const tar_1 = __importDefault(require("tar"));
const node_stream_1 = __importDefault(require("node:stream"));
const node_util_1 = require("node:util");
const async_retry_1 = __importDefault(require("async-retry"));
exports.defaultTestsToDownload = ["general", "mainnet", "minimal"];
exports.defaultSpecTestsRepoUrl = "https://github.com/ethereum/consensus-spec-tests";
// eslint-disable-next-line @typescript-eslint/no-empty-function
const logEmpty = () => { };
/**
 * Download spec tests
 */
async function downloadTests({ specVersion, specTestsRepoUrl, outputDir, testsToDownload }, log = logEmpty) {
    await downloadGenericSpecTests({
        specVersion,
        outputDir,
        specTestsRepoUrl: specTestsRepoUrl !== null && specTestsRepoUrl !== void 0 ? specTestsRepoUrl : exports.defaultSpecTestsRepoUrl,
        testsToDownload: testsToDownload !== null && testsToDownload !== void 0 ? testsToDownload : exports.defaultTestsToDownload,
    }, log);
}
exports.downloadTests = downloadTests;
/**
 * Generic Github release downloader.
 * Used by spec tests and SlashingProtectionInterchangeTest
 */
async function downloadGenericSpecTests({ specVersion, specTestsRepoUrl, outputDir, testsToDownload }, log = logEmpty) {
    log(`outputDir = ${outputDir}`);
    // Use version.txt as a flag to prevent re-downloading the tests
    const versionFile = node_path_1.default.join(outputDir, "version.txt");
    const existingVersion = node_fs_1.default.existsSync(versionFile) && node_fs_1.default.readFileSync(versionFile, "utf8").trim();
    if (existingVersion === specVersion) {
        return log(`version ${specVersion} already downloaded`);
    }
    else {
        log(`Downloading new version ${specVersion}`);
    }
    if (node_fs_1.default.existsSync(outputDir)) {
        log(`Cleaning existing version ${existingVersion} at ${outputDir}`);
        rimraf_1.default.sync(outputDir);
    }
    node_fs_1.default.mkdirSync(outputDir, { recursive: true });
    await Promise.all(testsToDownload.map(async (test) => {
        const url = `${specTestsRepoUrl !== null && specTestsRepoUrl !== void 0 ? specTestsRepoUrl : exports.defaultSpecTestsRepoUrl}/releases/download/${specVersion}/${test}.tar.gz`;
        await (0, async_retry_1.default)(
        // async (bail) => {
        async () => {
            const { data, headers } = await (0, axios_1.default)({
                method: "get",
                url,
                responseType: "stream",
                timeout: 30 * 60 * 1000,
            });
            const totalSize = headers["content-length"];
            log(`Downloading ${url} - ${totalSize} bytes`);
            // extract tar into output directory
            await (0, node_util_1.promisify)(node_stream_1.default.pipeline)(data, tar_1.default.x({ cwd: outputDir }));
            log(`Downloaded  ${url}`);
        }, {
            retries: 3,
            onRetry: (e, attempt) => {
                log(`Download attempt ${attempt} for ${url} failed: ${e.message}`);
            },
        });
        // download tar
    }));
    node_fs_1.default.writeFileSync(versionFile, specVersion);
}
exports.downloadGenericSpecTests = downloadGenericSpecTests;
//# sourceMappingURL=downloadTests.js.map