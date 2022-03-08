"use strict";
/**
 * Persist git data and distribute through NPM so CLI consumers can know exactly
 * at what commit was this src build. This is used in the metrics and to log initially.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readGitDataFile = exports.writeGitDataFile = exports.gitDataPath = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
/**
 * WARNING!! If you change this path make sure to update:
 * - 'packages/cli/package.json' -> .files -> `".git-data.json"`
 */
exports.gitDataPath = node_path_1.default.resolve(__dirname, "../../../.git-data.json");
/** Writes a persistent git data file. */
function writeGitDataFile(gitData) {
    node_fs_1.default.writeFileSync(exports.gitDataPath, JSON.stringify(gitData, null, 2));
}
exports.writeGitDataFile = writeGitDataFile;
/** Reads the persistent git data file. */
function readGitDataFile() {
    return JSON.parse(node_fs_1.default.readFileSync(exports.gitDataPath, "utf8"));
}
exports.readGitDataFile = readGitDataFile;
//# sourceMappingURL=gitDataPath.js.map