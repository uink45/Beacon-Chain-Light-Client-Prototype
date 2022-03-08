"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersionGitData = exports.getVersion = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const find_up_1 = __importDefault(require("find-up"));
const gitData_1 = require("./gitData");
var ReleaseTrack;
(function (ReleaseTrack) {
    ReleaseTrack["git"] = "git";
    ReleaseTrack["npm"] = "npm";
    ReleaseTrack["nightly"] = "nightly";
    ReleaseTrack["alpha"] = "alpha";
    ReleaseTrack["beta"] = "beta";
    ReleaseTrack["rc"] = "release candidate";
    ReleaseTrack["stable"] = "stable";
    ReleaseTrack["lts"] = "long term support";
})(ReleaseTrack || (ReleaseTrack = {}));
/** Defines default release track, i.e., the "stability" of tag releases */
const defaultReleaseTrack = ReleaseTrack.alpha;
/**
 * Gathers all information on package version including Git data.
 * @returns a version string, e.g., `v0.28.2/developer-feature/+7/80c248bb (nightly)`
 */
function getVersion() {
    var _a;
    const gitData = (0, gitData_1.readLodestarGitData)();
    let semver = gitData.semver;
    const numCommits = gitData.numCommits;
    const commitSlice = (_a = gitData.commit) === null || _a === void 0 ? void 0 : _a.slice(0, 8);
    // ansible github branch deployment returns no semver
    semver = semver !== null && semver !== void 0 ? semver : `v${getLocalVersion()}`;
    // Tag release has numCommits as "0"
    if (!commitSlice || numCommits === "0") {
        return `${semver} (${defaultReleaseTrack})`;
    }
    // Otherwise get branch and commit information
    return `${semver}/${gitData.branch}/${numCommits}/${commitSlice} (${ReleaseTrack.git})`;
}
exports.getVersion = getVersion;
/** Exposes raw version data wherever needed for reporting (metrics, grafana). */
function getVersionGitData() {
    return (0, gitData_1.readLodestarGitData)();
}
exports.getVersionGitData = getVersionGitData;
/** Returns local version from `lerna.json` or `package.json` as `"0.28.2"` */
function getLocalVersion() {
    return readVersionFromLernaJson() || readCliPackageJson();
}
/** Read version information from lerna.json */
function readVersionFromLernaJson() {
    const filePath = find_up_1.default.sync("lerna.json", { cwd: __dirname });
    if (!filePath)
        return undefined;
    const lernaJson = JSON.parse(node_fs_1.default.readFileSync(filePath, "utf8"));
    return lernaJson.version;
}
/** Read version information from package.json */
function readCliPackageJson() {
    const filePath = find_up_1.default.sync("package.json", { cwd: __dirname });
    if (!filePath)
        return undefined;
    const packageJson = JSON.parse(node_fs_1.default.readFileSync(filePath, "utf8"));
    return packageJson.version;
}
//# sourceMappingURL=version.js.map