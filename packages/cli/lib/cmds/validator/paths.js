"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultValidatorPaths = exports.getValidatorPaths = void 0;
const node_path_1 = __importDefault(require("node:path"));
const global_1 = require("../../paths/global");
/**
 * Defines the path structure of the validator files
 *
 * ```bash
 * $validatorRootDir
 * └── validator-db
 *     └── (db files)
 * ```
 */
function getValidatorPaths(args) {
    // Compute global paths first
    const globalPaths = (0, global_1.getGlobalPaths)(args);
    const rootDir = globalPaths.rootDir;
    const validatorsDbDir = args.validatorsDbDir || node_path_1.default.join(rootDir, "validator-db");
    return {
        ...globalPaths,
        validatorsDbDir,
    };
}
exports.getValidatorPaths = getValidatorPaths;
/**
 * Constructs representations of the path structure to show in command's description
 */
exports.defaultValidatorPaths = getValidatorPaths({ rootDir: "$rootDir" });
//# sourceMappingURL=paths.js.map