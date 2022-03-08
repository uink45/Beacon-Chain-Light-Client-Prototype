import { GitData } from "./gitData/gitDataPath";
/**
 * Gathers all information on package version including Git data.
 * @returns a version string, e.g., `v0.28.2/developer-feature/+7/80c248bb (nightly)`
 */
export declare function getVersion(): string;
/** Exposes raw version data wherever needed for reporting (metrics, grafana). */
export declare function getVersionGitData(): GitData;
//# sourceMappingURL=version.d.ts.map