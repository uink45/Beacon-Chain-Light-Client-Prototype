/**
 * This file is created in the build step and is distributed through NPM
 * MUST be in sync with `-/gitDataPath.ts` and `package.json` files.
 */
import { GitData } from "./gitDataPath";
/** Reads git data from a persisted file or local git data at build time. */
export declare function readLodestarGitData(): GitData;
/** Wrapper for updating git data. ONLY to be used with build scripts! */
export declare function forceUpdateGitData(): Partial<GitData>;
//# sourceMappingURL=index.d.ts.map