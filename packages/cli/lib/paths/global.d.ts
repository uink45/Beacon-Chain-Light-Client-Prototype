import { IGlobalArgs } from "../options";
export interface IGlobalPaths {
    rootDir: string;
    paramsFile?: string;
}
/**
 * Defines the path structure of the globally used files
 *
 * ```bash
 * $rootDir
 * └── $paramsFile
 * ```
 */
export declare function getGlobalPaths(args: Partial<IGlobalArgs>): IGlobalPaths;
export declare const defaultGlobalPaths: IGlobalPaths;
//# sourceMappingURL=global.d.ts.map