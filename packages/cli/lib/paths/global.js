"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultGlobalPaths = exports.getGlobalPaths = void 0;
const rootDir_1 = require("./rootDir");
/**
 * Defines the path structure of the globally used files
 *
 * ```bash
 * $rootDir
 * └── $paramsFile
 * ```
 */
function getGlobalPaths(args) {
    // Set rootDir to network name iff rootDir is not set explicitly
    const rootDir = args.rootDir || (0, rootDir_1.getDefaultRootDir)(args.network);
    const paramsFile = args.paramsFile;
    return {
        rootDir,
        paramsFile,
    };
}
exports.getGlobalPaths = getGlobalPaths;
exports.defaultGlobalPaths = getGlobalPaths({ rootDir: "$rootDir" });
//# sourceMappingURL=global.js.map