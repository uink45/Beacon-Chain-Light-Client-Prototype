"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceUpdateGitData = exports.readLodestarGitData = void 0;
const node_child_process_1 = require("node:child_process");
/**
 * This file is created in the build step and is distributed through NPM
 * MUST be in sync with `-/gitDataPath.ts` and `package.json` files.
 */
const gitDataPath_1 = require("./gitDataPath");
/** Silent shell that won't pollute stdout, or stderr */
function shell(cmd) {
    return (0, node_child_process_1.execSync)(cmd, { stdio: ["ignore", "pipe", "ignore"] })
        .toString()
        .trim();
}
/** Tries to get branch from git CLI. */
function getBranch() {
    try {
        return shell("git rev-parse --abbrev-ref HEAD");
    }
    catch (e) {
        return undefined;
    }
}
/** Tries to get commit from git from git CLI. */
function getCommit() {
    try {
        return shell("git rev-parse --verify HEAD");
    }
    catch (e) {
        return undefined;
    }
}
/** Tries to get the latest tag from git CLI. */
function getLatestTag() {
    try {
        return shell("git describe --abbrev=0");
    }
    catch (e) {
        return undefined;
    }
}
/** Gets number of commits since latest tag/release. */
function getCommitsSinceRelease() {
    let numCommits = 0;
    const latestTag = getLatestTag();
    try {
        numCommits = +shell(`git rev-list ${latestTag}..HEAD --count`);
    }
    catch (e) {
        return undefined;
    }
    return numCommits;
}
/** Reads git data from a persisted file or local git data at build time. */
function readLodestarGitData() {
    try {
        const currentGitData = getGitData();
        const persistedGitData = getPersistedGitData();
        // If the CLI is run from source, prioritze current git data
        // over `.git-data.json` file, which might be stale here.
        let gitData = { ...persistedGitData, ...currentGitData };
        // If the CLI is not run from the git repository, fall back to persistent
        if (!gitData.semver || !gitData.branch || !gitData.commit) {
            gitData = persistedGitData;
        }
        return {
            semver: gitData === null || gitData === void 0 ? void 0 : gitData.semver,
            branch: (gitData === null || gitData === void 0 ? void 0 : gitData.branch) || "N/A",
            commit: (gitData === null || gitData === void 0 ? void 0 : gitData.commit) || "N/A",
            numCommits: (gitData === null || gitData === void 0 ? void 0 : gitData.numCommits) || "",
        };
    }
    catch (e) {
        return { semver: "", branch: "", commit: "", numCommits: "" };
    }
}
exports.readLodestarGitData = readLodestarGitData;
/** Wrapper for updating git data. ONLY to be used with build scripts! */
function forceUpdateGitData() {
    return getGitData();
}
exports.forceUpdateGitData = forceUpdateGitData;
/** Gets git data containing current branch and commit info from CLI. */
function getGitData() {
    const numCommits = getCommitsSinceRelease();
    let strCommits = "";
    if (numCommits !== undefined && numCommits > 0) {
        strCommits = `+${numCommits}`;
    }
    return {
        branch: getBranch(),
        commit: getCommit(),
        semver: getLatestTag(),
        numCommits: strCommits,
    };
}
/** Gets git data containing current branch and commit info from persistent file. */
function getPersistedGitData() {
    try {
        return (0, gitDataPath_1.readGitDataFile)();
    }
    catch (e) {
        return {};
    }
}
//# sourceMappingURL=index.js.map